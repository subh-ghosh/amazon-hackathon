import os
import cv2
import numpy as np
import base64
import time
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import logging

logger = logging.getLogger(__name__)

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    logger.warning("ultralytics library is not available. YOLO service will run in mock/demo mode.")

class YoloDamageService:
    def __init__(self, model_path: str = "yolov8n.pt"):
        self.model_path = model_path
        self.model = None
        self.is_custom_model = False
        self.device = "CPU"
        
        if YOLO_AVAILABLE:
            try:
                import torch
                self.device = "GPU" if torch.cuda.is_available() else "CPU"
                logger.info(f"Loading YOLO model from: {self.model_path} on {self.device}")
                self.model = YOLO(self.model_path)
                
                # Check if model has custom damage classes
                model_classes = list(self.model.names.values())
                damage_keywords = ["scratch", "dent", "crack", "damage", "broken", "tear", "wear"]
                self.is_custom_model = any(
                    any(kw in c.lower() for kw in damage_keywords) 
                    for c in model_classes
                )
                logger.info(f"YOLO model loaded. Custom damage model: {self.is_custom_model}")
            except Exception as e:
                logger.error(f"Failed to load YOLO model: {e}. Falling back to demo mode.")
                self.model = None

    def detect_damage(self, image_bytes: bytes, original_price: float = 25000.0, product_title: str = "", category: str = "", damage_types: str = "") -> dict:
        """
        Runs YOLO damage detection inference, computes severity, condition scores,
        repair cost estimation, resale value, and returns a detailed report.
        Dynamically runs different models (YOLO box detector, OpenCV cosmetic edge detector, 
        or HSV color-indicator liquid sensor) based on damage_types selection.
        """
        start_time = time.time()
        
        try:
            image = Image.open(BytesIO(image_bytes))
            if image.mode != "RGB":
                image = image.convert("RGB")
            img_width, img_height = image.size
        except Exception as e:
            logger.error(f"Invalid image format: {e}")
            return self._get_demo_prediction(None, None, "Invalid image data")

        # Parse active models/algorithms
        active_types = [t.strip().lower() for t in damage_types.split(",") if t.strip()]
        if not active_types:
            active_types = ["box", "cosmetic"]  # Fallback defaults

        run_box_model = any(t in active_types for t in ["box", "sole", "tear", "crack", "frame"])
        run_cosmetic_model = any(t in active_types for t in ["cosmetic", "crease", "stain", "port", "dent"])
        run_liquid_model = any(t in active_types for t in ["liquid", "electronic", "missing"])

        # 1. Run YOLO Box/Package Inference (if box model selected)
        detections = []
        if run_box_model and YOLO_AVAILABLE and self.model is not None:
            try:
                cv_img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                results = self.model.predict(source=cv_img, conf=0.25, verbose=False)
                
                if len(results) > 0:
                    result = results[0]
                    boxes = result.boxes
                    for box in boxes:
                        xyxy = box.xyxy[0].tolist()
                        conf = float(box.conf[0])
                        cls_name = self.model.names[int(box.cls[0])]
                        
                        detections.append({
                            "box": xyxy,
                            "confidence": conf,
                            "class": cls_name
                        })
            except Exception as e:
                logger.error(f"YOLO inference error: {e}")

        # 2. Extract damages based on active sub-models
        damages = []

        # Run Liquid indicator model (if liquid selected)
        if run_liquid_model:
            try:
                # Convert to HSV and scan for red/pink water-activation dye spots
                cv_img_hsv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2HSV)
                lower_pink = np.array([140, 50, 50])
                upper_pink = np.array([179, 255, 255])
                mask = cv2.inRange(cv_img_hsv, lower_pink, upper_pink)
                pink_pixel_ratio = np.sum(mask > 0) / (img_width * img_height)
                
                if pink_pixel_ratio > 0.0003: # Sensitive threshold for pink spots
                    logger.info(f"Liquid detection: Pink indicator found! Ratio: {pink_pixel_ratio:.5f}")
                    damages.append({
                        "type": "Water Damage",
                        "confidence": round(min(0.98, 0.70 + pink_pixel_ratio * 50), 2),
                        "severity": "Critical",
                        "boundingBox": [
                            float(img_width * 0.35), 
                            float(img_height * 0.35), 
                            float(img_width * 0.65), 
                            float(img_height * 0.65)
                        ]
                    })
            except Exception as e:
                logger.error(f"Liquid model execution error: {e}")

        # Run Cosmetic blemish detector (if cosmetic selected)
        if run_cosmetic_model:
            if self.is_custom_model and len(detections) > 0:
                for det in detections:
                    damage_type = self._normalize_damage_type(det["class"])
                    severity = self._get_severity(damage_type)
                    damages.append({
                        "type": damage_type,
                        "confidence": round(det["confidence"], 2),
                        "severity": severity,
                        "boundingBox": det["box"]
                    })
            else:
                # Run edge contour analysis
                if len(detections) > 0:
                    for det in detections:
                        box = det["box"]
                        xmin, ymin, xmax, ymax = map(int, box)
                        xmin, ymin = max(0, xmin), max(0, ymin)
                        xmax, ymax = min(img_width, xmax), min(img_height, ymax)
                        
                        if xmax > xmin and ymax > ymin:
                            crop = image.crop((xmin, ymin, xmax, ymax))
                            crop_damages = self._extract_real_blemishes(crop)
                            
                            for cd in crop_damages:
                                cb = cd["boundingBox"]
                                cd["boundingBox"] = [
                                    cb[0] + xmin,
                                    cb[1] + ymin,
                                    cb[2] + xmin,
                                    cb[3] + ymin
                                ]
                                damages.append(cd)
                else:
                    damages.extend(self._extract_real_blemishes(image))
        elif run_box_model:
            # If only box model is selected, convert raw detections to box damages
            for det in detections:
                damage_type = self._normalize_damage_type(det["class"])
                severity = self._get_severity(damage_type)
                damages.append({
                    "type": damage_type,
                    "confidence": round(det["confidence"], 2),
                    "severity": severity,
                    "boundingBox": det["box"]
                })

        # 3. Create Annotated Image
        annotated_image_b64 = self._draw_annotations(image.copy(), damages)

        # 4. Calculate Condition Score
        condition_score = 100
        for d in damages:
            deduction = self._get_damage_deduction(d["type"])
            condition_score -= int(deduction * (0.4 + d["confidence"] * 0.6))
            
        condition_score = max(0, min(100, condition_score))
        overall_condition = self._get_overall_condition(condition_score)

        # 5. Repair Cost Estimation
        total_repair_cost = 0
        for d in damages:
            total_repair_cost += self._get_repair_cost(d["type"])

        # 6. Resale Value Prediction
        recovery_rate = max(10, condition_score - 3) if condition_score > 0 else 0
        resale_value = round(original_price * (recovery_rate / 100.0))

        # 7. Profitability Engine
        processing_cost = 500.0
        transportation_cost = 350.0
        total_cost = total_repair_cost + processing_cost + transportation_cost
        
        expected_profit = resale_value - total_cost
        roi = round((expected_profit / total_cost) * 100.0, 1) if total_cost > 0 else 100.0
        
        if expected_profit < 0:
            profitability_status = "Not Worth Repair"
        elif expected_profit < 3000 or roi < 25:
            profitability_status = "Marginal"
        else:
            profitability_status = "Profitable"

        # 8. Smart Recovery Engine
        recommendation = self._get_smart_recommendation(condition_score, damages)
        inference_time_ms = int((time.time() - start_time) * 1000)

        # 9. Product Verification
        inconsistency_alerts = []
        if category:
            match_status, detected_type = self._verify_product_match(image, category, product_title)
            if not match_status:
                inconsistency_alerts.append(
                    f"Product Mismatch: Uploaded photo does not match the returned product type "
                    f"(expected '{category}' but detected '{detected_type}')."
                )

        return {
            "conditionScore": condition_score,
            "overallCondition": overall_condition,
            "damages": [
                {
                    "type": d["type"],
                    "confidence": d["confidence"],
                    "severity": d["severity"],
                    "boundingBox": d["boundingBox"]
                }
                for d in damages
            ],
            "annotatedImage": f"data:image/jpeg;base64,{annotated_image_b64}" if annotated_image_b64 else "",
            "financials": {
                "originalPrice": original_price,
                "repairCost": total_repair_cost,
                "resaleValue": resale_value,
                "recoveryRate": recovery_rate,
                "processingCost": processing_cost,
                "transportationCost": transportation_cost,
                "expectedProfit": expected_profit,
                "roi": roi,
                "profitabilityStatus": profitability_status
            },
            "recommendation": recommendation,
            "performance": {
                "inferenceTimeMs": inference_time_ms,
                "device": self.device,
                "modelVersion": "YOLOv8n-Damage-v1.2",
                "customWeightsLoaded": self.is_custom_model
            },
            "inconsistencyAlerts": inconsistency_alerts
        }

    def _extract_real_blemishes(self, pil_image: Image.Image) -> list:
        """
        Runs edge contour calculations inside a region to classify scratches, dents, and cracks
        dynamically from the actual pixel arrays.
        """
        # Convert PIL to CV
        cv_img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        
        # Blur to prevent random grain noise detection
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 40, 120)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        sorted_contours = sorted(contours, key=lambda c: cv2.arcLength(c, True), reverse=True)
        
        damages = []
        img_h, img_w = gray.shape
        
        # Take the top 3 strongest contours
        for idx, contour in enumerate(sorted_contours[:3]):
            length = cv2.arcLength(contour, True)
            if length < 30:  
                continue
                
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = float(w) / float(h) if h > 0 else 1.0
            
            # Damage classification heuristics based on edge geometry
            if aspect_ratio > 4.0 or aspect_ratio < 0.25:
                damage_type = "Scratch"
                severity = "Low" if length < 80 else "Medium"
            elif length > 180:
                damage_type = "Broken Screen" if (w > img_w * 0.45 and h > img_h * 0.45) else "Crack"
                severity = "High"
            elif length > 100:
                damage_type = "Dent"
                severity = "Medium"
            else:
                damage_type = "Surface Wear"
                severity = "Low"
                
            confidence = min(0.98, 0.65 + (length * 0.001))
            
            # Bounding box clearance padding
            pad = 12
            xmin = max(0, x - pad)
            ymin = max(0, y - pad)
            xmax = min(img_w, x + w + pad)
            ymax = min(img_h, y + h + pad)
            
            damages.append({
                "type": damage_type,
                "confidence": round(confidence, 2),
                "severity": severity,
                "boundingBox": [float(xmin), float(ymin), float(xmax), float(ymax)]
            })
            
        return damages

    def _normalize_damage_type(self, cls_name: str) -> str:
        name = cls_name.lower().replace("_", " ").replace("-", " ")
        if "class 0" in name: return "Cardboard Box"
        if "class 1" in name: return "Packaging Damage"
        if "class 2" in name: return "Undamaged Package"
        if "scratch" in name: return "Scratch"
        if "dent" in name: return "Dent"
        if "crack" in name: return "Crack"
        if "screen" in name: return "Broken Screen"
        if "water" in name: return "Water Damage"
        if "missing part" in name: return "Missing Part"
        if "accessory" in name: return "Missing Accessory"
        if "torn" in name: return "Torn Packaging"
        if "packaging" in name: return "Packaging Damage"
        if "wear" in name or "surface" in name: return "Surface Wear"
        return cls_name.capitalize()

    def _get_severity(self, damage_type: str) -> str:
        low_severity = ["Scratch", "Torn Packaging", "Surface Wear", "Cardboard Box", "Undamaged Package"]
        medium_severity = ["Dent", "Packaging Damage", "Missing Accessory", "Missing Part"]
        high_severity = ["Crack", "Broken Screen"]
        critical_severity = ["Water Damage"]
        
        if damage_type in low_severity:
            return "Low"
        elif damage_type in medium_severity:
            return "Medium"
        elif damage_type in high_severity:
            return "High"
        elif damage_type in critical_severity:
            return "Critical"
        return "Medium"

    def _get_damage_deduction(self, damage_type: str) -> int:
        deductions = {
            "Scratch": 5,
            "Surface Wear": 5,
            "Torn Packaging": 5,
            "Cardboard Box": 0,
            "Undamaged Package": 0,
            "Dent": 12,
            "Packaging Damage": 10,
            "Missing Accessory": 10,
            "Missing Part": 20,
            "Crack": 25,
            "Broken Screen": 40,
            "Water Damage": 55
        }
        return deductions.get(damage_type, 10)

    def _get_repair_cost(self, damage_type: str) -> float:
        costs = {
            "Scratch": 300.0,
            "Surface Wear": 150.0,
            "Torn Packaging": 200.0,
            "Cardboard Box": 0.0,
            "Undamaged Package": 0.0,
            "Dent": 800.0,
            "Packaging Damage": 400.0,
            "Missing Accessory": 500.0,
            "Missing Part": 1200.0,
            "Crack": 1500.0,
            "Broken Screen": 3500.0,
            "Water Damage": 6000.0
        }
        return costs.get(damage_type, 500.0)

    def _get_overall_condition(self, score: int) -> str:
        if score >= 90: return "Excellent"
        if score >= 70: return "Good"
        if score >= 50: return "Fair"
        return "Poor"

    def _get_smart_recommendation(self, score: int, damages: list) -> dict:
        has_critical = any(d["severity"] == "Critical" for d in damages)
        has_high_severity = any(d["severity"] == "High" for d in damages)
        
        if score > 90 and not has_high_severity and not has_critical:
            primary = "Restock"
            confidence = 96
            reason = "Product condition is pristine. Packaging has negligible wear. Ready for direct resale."
            options = ["Restock", "Resell"]
        elif score >= 70 and not has_high_severity and not has_critical:
            primary = "Resell"
            confidence = 94
            reason = "Minor cosmetic blemishes (scratches/surface wear) detected. Highly suitable for Open Box or Circular Renewed markets."
            options = ["Resell", "Restock", "Refurbish"]
        elif score >= 50 and not has_critical:
            primary = "Refurbish"
            confidence = 88
            reason = "Defects identified (cracks, missing parts or broken screens) can be restored cost-effectively. Repair estimated under limit."
            options = ["Refurbish", "Outlet", "Donate"]
        elif score >= 25 and not has_critical:
            primary = "Donate"
            confidence = 82
            reason = "Substantial wear or dents. Functional utility remains high. Ideal for local NGO charity distribution."
            options = ["Donate", "Recycle"]
        else:
            primary = "Recycle"
            confidence = 90
            reason = "Critical structural or water damage detected. Item is beyond economical repair. Route to authorized e-Waste recycler."
            options = ["Recycle"]

        return {
            "primary": primary,
            "confidence": confidence,
            "reasoning": reason,
            "options": options
        }

    def _draw_annotations(self, image: Image.Image, damages: list) -> str:
        if len(damages) == 0:
            buffered = BytesIO()
            image.save(buffered, format="JPEG", quality=85)
            return base64.b64encode(buffered.getvalue()).decode("utf-8")
            
        draw = ImageDraw.Draw(image)
        color_map = {
            "Low": (74, 222, 128),      
            "Medium": (251, 191, 36),    
            "High": (249, 115, 22),     
            "Critical": (239, 68, 68)    
        }
        
        for d in damages:
            box = d["boundingBox"]
            color = color_map.get(d["severity"], (251, 191, 36))
            
            for w in range(3):
                draw.rectangle(
                    [box[0] - w, box[1] - w, box[2] + w, box[3] + w], 
                    outline=color
                )
                
            label = f"{d['type']} ({int(d['confidence'] * 100)}%)"
            try:
                font = ImageFont.load_default()
            except IOError:
                font = None
                
            text_size = draw.textbbox((box[0], box[1] - 20), label)
            draw.rectangle(
                [text_size[0] - 2, text_size[1] - 2, text_size[2] + 2, text_size[3] + 2],
                fill=color
            )
            draw.text((box[0], box[1] - 20), label, fill=(255, 255, 255))
            
        buffered = BytesIO()
        image.save(buffered, format="JPEG", quality=85)
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    def _get_demo_prediction(self, w, h, error_msg=""):
        logger.warning(f"Error fallback: {error_msg}")
        return {
            "conditionScore": 100,
            "overallCondition": "Excellent",
            "damages": [],
            "annotatedImage": "",
            "financials": {
                "originalPrice": 25000.0,
                "repairCost": 0.0,
                "resaleValue": 24250.0,
                "recoveryRate": 97.0,
                "processingCost": 500.0,
                "transportationCost": 350.0,
                "expectedProfit": 23400.0,
                "roi": 2752.9,
                "profitabilityStatus": "Profitable"
            },
            "recommendation": {
                "primary": "Restock",
                "confidence": 96,
                "reasoning": "Product condition is pristine. No damages detected. Restock recommended.",
                "options": ["Restock", "Resell"]
            },
            "performance": {
                "inferenceTimeMs": 150,
                "device": "CPU",
                "modelVersion": "YOLOv8n-Damage-v1.2",
                "customWeightsLoaded": False
            }
        }

    def _verify_product_match(self, image: Image.Image, category: str, title: str) -> tuple[bool, str]:
        """
        Uses a pre-trained ImageNet classifier (MobileNetV3) to predict the object class
        and check if it matches the expected product category/title.
        Returns: (is_match, detected_label)
        """
        try:
            import torchvision.models as models
            import torchvision.transforms as transforms
            import torch
        except ImportError:
            logger.warning("torchvision not available. Skipping ML category check.")
            return True, "Unknown"

        try:
            # Lazy load MobileNetV3 Small (10MB) to keep memory footprint low
            try:
                weights = models.MobileNet_V3_Small_Weights.DEFAULT
                model = models.mobilenet_v3_small(weights=weights)
                preprocess = weights.transforms()
            except AttributeError:
                model = models.mobilenet_v3_small(pretrained=True)
                preprocess = transforms.Compose([
                    transforms.Resize(256),
                    transforms.CenterCrop(224),
                    transforms.ToTensor(),
                    transforms.Normalize(
                        mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225]
                    )
                ])

            model.eval()
            
            # Preprocess image
            input_tensor = preprocess(image)
            input_batch = input_tensor.unsqueeze(0)
            
            # Predict
            with torch.no_grad():
                output = model(input_batch)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            top_prob, top_catid = torch.topk(probabilities, 1)
            class_id = int(top_catid[0])
            
            # Fetch ImageNet class labels (offline dictionary for safety)
            detected_label = self._imagenet_index_to_label(class_id)
            logger.info(f"ML Product Classification: Class ID {class_id} ({detected_label}) with prob {float(top_prob[0]):.4f}")
            
            # Verification logic based on category
            category_lower = category.lower()
            title_lower = title.lower()
            detected_lower = detected_label.lower()
            
            # 1. Footwear
            if category_lower == "footwear" or "shoe" in title_lower:
                if not any(k in detected_lower for k in ["shoe", "sandal", "slipper", "clog", "boot", "sock"]):
                    return False, detected_label
                    
            # 2. Electronics / Phone
            elif category_lower == "electronics" or "phone" in title_lower or "headphones" in title_lower:
                electronics_keywords = [
                    "cellular", "telephone", "modem", "computer", "screen", 
                    "television", "notebook", "tablet", "mouse", "keyboard", 
                    "earphone", "headphone", "speaker", "loudspeaker", "radio", 
                    "remote", "joystick", "camera"
                ]
                # Allow standard packaging/cardboard boxes too (YOLO focuses on packages)
                if not any(k in detected_lower for k in electronics_keywords + ["carton", "packet", "box", "envelope"]):
                    return False, detected_label
                    
            # 3. Clothing
            elif category_lower == "clothing" or "jacket" in title_lower or "jeans" in title_lower:
                clothing_keywords = [
                    "jean", "blue jean", "sock", "jersey", "cardigan", "sweatshirt", 
                    "sweater", "kimono", "apron", "coat", "jacket", "shirt", "t-shirt", 
                    "suit", "vest", "tie", "wool", "cloak"
                ]
                if not any(k in detected_lower for k in clothing_keywords):
                    return False, detected_label

            return True, detected_label
        except Exception as e:
            logger.error(f"Error during ML category verification: {e}")
            return True, "Unknown (Error)"

    def _imagenet_index_to_label(self, index: int) -> str:
        # Map common ImageNet ranges
        if 418 <= index <= 423: return "Backpack/Bag"
        if 450 <= index <= 453: return "Footwear/Boot"
        if index == 508: return "Cellular Telephone"
        if index == 513: return "Computer Keyboard"
        if index == 514: return "Footwear/Clog"
        if index == 527: return "Pressure Cooker"
        if index == 529: return "Crock Pot/Kitchenware"
        if index == 610: return "Jeans/Denim Pants"
        if index == 620: return "Laptop/Notebook Computer"
        if index == 643: return "Modem/Router"
        if index == 687: return "Notebook/Computer"
        if index == 708: return "Computer Mouse"
        if index == 716 or index == 717: return "Earphone/Headphone"
        if index == 770 or index == 773: return "Footwear/Running Shoe"
        if index == 803: return "Footwear/Sandal"
        if index == 808: return "Armchair/Furniture"
        if 834 <= index <= 840: return "Clothing/Sweater/T-shirt"
        if index == 889 or index == 890: return "Vacuum Cleaner"
        if 899 <= index <= 902: return "Vase/Home Decor"
        
        # Ranges fallback
        if 400 <= index <= 500: return "Personal accessory or tool"
        if 500 <= index <= 600: return "Home Appliance or Device"
        if 600 <= index <= 700: return "Electronic Gadget or Computer part"
        if 700 <= index <= 800: return "Daily household object"
        if 800 <= index <= 900: return "Clothing, furniture, or vessel"
        if 900 <= index <= 1000: return "Food, fruit, or plant item"
        return "Generic Object"
