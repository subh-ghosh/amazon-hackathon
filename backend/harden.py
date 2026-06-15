import os
import re

files_to_harden = [
    "Service 3 Fraud & Trust Engine/app/models/schemas.py",
    "Service 4 Product Digital Twin/app/models/schemas.py",
    "Service 5 Future Simulator/app/models/schemas.py",
    "Service 6 Recovery Optimizer/app/models/schemas.py",
    "Service 7 Reverse Logistics Optimizer/app/models/schemas.py",
    "Service 12 Learning & Knowledge Graph/app/models/schemas.py"
]

for fpath in files_to_harden:
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r") as f:
        content = f.read()

    # 1. Add ConfigDict to imports if missing
    if "ConfigDict" not in content:
        content = re.sub(r'from pydantic import (.*)', r'from pydantic import \1, ConfigDict', content, count=1)
    
    if "Field" not in content and "pydantic" in content:
        content = re.sub(r'from pydantic import (.*)', r'from pydantic import \1, Field', content, count=1)

    # 2. Add model_config to all classes inheriting from BaseModel
    # Match class Name(BaseModel):
    #   <optional docstring>
    # -> add model_config = ConfigDict(extra="forbid")
    
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        new_lines.append(line)
        if re.match(r'^class \w+\(BaseModel\):$', line) or re.match(r'^class \w+\(.*BaseModel.*\):$', line):
            # Check if next lines already have model_config
            j = i + 1
            has_config = False
            while j < len(lines) and (lines[j].strip() == '' or lines[j].startswith('    ') or lines[j].startswith('\t')):
                if 'model_config' in lines[j]:
                    has_config = True
                    break
                j += 1
            if not has_config:
                new_lines.append('    model_config = ConfigDict(extra="forbid")')
        i += 1

    content = '\n'.join(new_lines)

    # 3. Harden String fields: `var: str` -> `var: str = Field(min_length=1, max_length=255, strip_whitespace=True)`
    # Be careful not to replace inside functions or if already Field
    # Let's do a simple regex for `    var: str` -> `    var: str = Field(min_length=1, max_length=255, strip_whitespace=True)`
    # and `    var: Optional[str] = None` -> `    var: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)`
    
    # Simple replacement for typical definitions
    content = re.sub(r'^(\s+\w+):\s*str$', r'\1: str = Field(min_length=1, max_length=255, strip_whitespace=True)', content, flags=re.MULTILINE)
    content = re.sub(r'^(\s+\w+):\s*Optional\[str\]\s*=\s*None$', r'\1: Optional[str] = Field(default=None, min_length=1, max_length=255, strip_whitespace=True)', content, flags=re.MULTILINE)

    # 4. Harden float for S3/S6 NaN limits
    #    `var: float` -> `var: float = Field(allow_inf_nan=False)`
    content = re.sub(r'^(\s+\w+):\s*float$', r'\1: float = Field(allow_inf_nan=False)', content, flags=re.MULTILINE)
    # If it already has Field(..., we can't easily regex it, we will manually fix those if they exist or just add allow_inf_nan to them
    content = re.sub(r'Field\(([^)]*ge=0.0[^)]*)\)', r'Field(\1, allow_inf_nan=False)', content)

    with open(fpath, "w") as f:
        f.write(content)
    print(f"Hardened {fpath}")

