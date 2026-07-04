import threading
import uuid
import logging
from typing import List, Dict, Optional, Any
from fastapi import BackgroundTasks
from app.models.schemas import EvaluateRequest, EvaluateResponse, JobStatusResponse
from app.services.evaluation import EvaluationEngine
from app.services.persistence import persistence

# Configure logger
logger = logging.getLogger("returnless_refund_service")

class JobManager:
    def __init__(self):
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.RLock()

    def create_job(self, requests: List[EvaluateRequest], correlation_id: str, background_tasks: BackgroundTasks) -> str:
        job_id = str(uuid.uuid4())
        
        with self._lock:
            job = {
                "jobId": job_id,
                "status": "PENDING",
                "correlationId": correlation_id,
                "responses": None
            }
            self._jobs[job_id] = job
            persistence.put_job(job)
            
        background_tasks.add_task(self._run_job, job_id, requests, correlation_id)
        logger.info(f"Created async batch job {job_id} containing {len(requests)} requests.")
        return job_id

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                job = persistence.get_job(job_id)
                if job:
                    self._jobs[job_id] = job
            return job

    def _run_job(self, job_id: str, requests: List[EvaluateRequest], correlation_id: str):
        logger.info(f"Starting execution of async job {job_id}")
        responses: List[EvaluateResponse] = []
        try:
            for req in requests:
                # Run the evaluation engine for each request in the batch
                res = EvaluationEngine.evaluate(req, correlation_id)
                responses.append(res)
            
            with self._lock:
                self._jobs[job_id]["status"] = "COMPLETED"
                self._jobs[job_id]["responses"] = responses
                persistence.update_job(job_id, {
                    "status": "COMPLETED",
                    "responses": [response.model_dump(mode="json") for response in responses],
                })
                
            logger.info(f"Async job {job_id} completed successfully.")
        except Exception as e:
            logger.error(f"Error processing async job {job_id}: {str(e)}", exc_info=True)
            with self._lock:
                self._jobs[job_id]["status"] = "FAILED"
                self._jobs[job_id]["responses"] = []
                persistence.update_job(job_id, {"status": "FAILED", "responses": []})

# Global Job Manager instance
job_manager = JobManager()
