"""
Modal FLUX Image Generation
"""

import io
import base64

import modal
from modal import Image, Secret
from fastapi import Request

diffusers_commit_sha = "81cf3b2f155f1de322079af28f625349ee21ec6b"

flux_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "libglib2.0-0", "libsm6", "libgl1-mesa-glx")
    .pip_install(
        "torch==2.4.1",
        "git+https://github.com/huggingface/diffusers.git@81cf3b2f155f1de322079af28f625349ee21ec6b",
        "huggingface_hub",
        "accelerate",
        "safetensors",
        "fastapi[standard]",
    )
    .env({
        "TORCHINDUCTOR_FX_GRAPH_CACHE": "1",
    })
)

app = modal.App("flux-gen", image=flux_image)


@app.cls(gpu="T4", timeout=600)
class FluxModel:
    @modal.enter()
    def enter(self):
        import torch
        from diffusers import FluxPipeline

        print("Loading FLUX.1-schnell...")
        self.pipe = FluxPipeline.from_pretrained(
            "black-forest-labs/FLUX.1-schnell",
            torch_dtype=torch.bfloat16,
        ).to("cuda")
        print("Model ready!")

    @modal.method()
    def inference(self, prompt: str) -> dict:
        print(f"Generating: {prompt[:50]}...")
        
        out = self.pipe(
            prompt,
            output_type="pil",
            num_inference_steps=4,
            guidance_scale=0.0,
        ).images[0]

        buffer = io.BytesIO()
        out.save(buffer, format="PNG")
        img_b64 = base64.b64encode(buffer.getvalue()).decode()

        return {
            "success": True,
            "image": f"data:image/png;base64,{img_b64}",
            "prompt": prompt,
        }


@app.function(
    image=flux_image,
    gpu="T4",
    timeout=600,
)
@modal.fastapi_endpoint(method="POST")
async def generate(request: Request):
    """API endpoint for image generation"""
    body = await request.json()
    prompt = body.get("prompt", "")

    if not prompt:
        return {"error": "No prompt provided"}

    try:
        model = FluxModel()
        result = model.inference.remote(prompt)
        return result
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}
