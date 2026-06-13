class VisionAnalysis:
    def analyze_images(self, images: list) -> list:
        # Fallback to deterministic mock analysis if Bedrock unavailable
        indicators = []
        for img in images:
            if "empty" in img.lower():
                indicators.append("EMPTY_BOX")
            if "used" in img.lower():
                indicators.append("USED_CONDITION")
        return indicators

vision_analyzer = VisionAnalysis()
