from datetime import datetime, timezone
from app.models.schemas import (
    ProductTwin, CreateTwinInput, UpdateTwinInput, ProductStatus,
    ReturnEventInput, FraudEventInput, RepairEventInput, RecoveryEventInput, LogisticsEventInput,
    ReturnEvent, FraudEvent, RepairEvent, RecoveryEvent, LogisticsEvent
)
from app.services.dynamodb_service import dynamodb_service

class TwinNotFoundError(Exception):
    pass

class TwinService:
    
    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def create_twin(self, data: CreateTwinInput) -> ProductTwin:
        now = self._now()
        twin = ProductTwin(
            productId=data.productId,
            sku=data.sku,
            category=data.category,
            conditionScore=data.conditionScore,
            utilityScore=data.utilityScore,
            createdAt=now,
            updatedAt=now
        )
        dynamodb_service.put_item(twin.model_dump())
        return twin

    def get_twin(self, product_id: str) -> ProductTwin:
        item = dynamodb_service.get_item(product_id)
        if not item:
            raise TwinNotFoundError()
        return ProductTwin(**item)

    def update_twin(self, product_id: str, data: UpdateTwinInput) -> ProductTwin:
        twin = self.get_twin(product_id)
        
        if data.conditionScore is not None:
            twin.conditionScore = data.conditionScore
        if data.utilityScore is not None:
            twin.utilityScore = data.utilityScore
        if data.currentStatus is not None:
            twin.currentStatus = data.currentStatus
            
        twin.updatedAt = self._now()
        dynamodb_service.put_item(twin.model_dump())
        return twin

    def add_return_event(self, product_id: str, data: ReturnEventInput) -> ProductTwin:
        twin = self.get_twin(product_id)
        now = self._now()
        
        event = ReturnEvent(
            timestamp=now,
            returnReason=data.returnReason,
            conditionScore=data.conditionScore
        )
        
        twin.returnCount += 1
        twin.returnHistory.append(event)
        twin.conditionScore = data.conditionScore
        twin.currentStatus = ProductStatus.RETURNED
        twin.updatedAt = now
        
        dynamodb_service.put_item(twin.model_dump())
        return twin

    def add_fraud_event(self, product_id: str, data: FraudEventInput) -> ProductTwin:
        twin = self.get_twin(product_id)
        now = self._now()
        
        # We append to fraudFlags. We could also store history but instructions say "append fraudFlags"
        twin.fraudFlags.append(data.fraudType)
        
        if data.fraudScore > 70:
            twin.currentStatus = ProductStatus.FRAUD_REVIEW
            
        twin.updatedAt = now
        dynamodb_service.put_item(twin.model_dump())
        return twin

    def add_repair_event(self, product_id: str, data: RepairEventInput) -> ProductTwin:
        twin = self.get_twin(product_id)
        now = self._now()
        
        event = RepairEvent(
            timestamp=now,
            repairType=data.repairType,
            cost=data.cost
        )
        
        twin.repairCount += 1
        twin.repairHistory.append(event)
        twin.updatedAt = now
        dynamodb_service.put_item(twin.model_dump())
        return twin

    def add_recovery_event(self, product_id: str, data: RecoveryEventInput) -> ProductTwin:
        twin = self.get_twin(product_id)
        now = self._now()
        
        event = RecoveryEvent(
            timestamp=now,
            decision=data.decision,
            expectedProfit=data.expectedProfit
        )
        
        twin.recoveryHistory.append(event)
        
        # update currentStatus based on decision
        decision_map = {
            "REFURBISH": ProductStatus.REFURBISHING,
            "RESTOCK_AS_NEW": ProductStatus.ACTIVE,
            "OUTLET_SALE": ProductStatus.OUTLET_READY,
            "DONATE": ProductStatus.DONATED,
            "RECYCLE": ProductStatus.RECYCLED,
            "RETURN_TO_VENDOR": ProductStatus.RETURN_TO_VENDOR
        }
        
        if data.decision in decision_map:
            twin.currentStatus = decision_map[data.decision]
            
        twin.updatedAt = now
        dynamodb_service.put_item(twin.model_dump())
        return twin

    def add_logistics_event(self, product_id: str, data: LogisticsEventInput) -> ProductTwin:
        twin = self.get_twin(product_id)
        now = self._now()
        
        event = LogisticsEvent(
            timestamp=now,
            warehouseId=data.warehouseId,
            route=data.route
        )
        
        twin.logisticsHistory.append(event)
        twin.updatedAt = now
        dynamodb_service.put_item(twin.model_dump())
        return twin

twin_service = TwinService()
