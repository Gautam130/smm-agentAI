"""
Modal FLUX Image Generation
Usage: modal deploy modal_generate.py
"""

import io
import base64

import modal
from modal import Image

image = (
    Image.from_registry("pytorch/pytorch:2.4.0-cuda12.4-cudnn9-runtime")
    .pip_install(
        "diffusers>=0.31.0",
        "torch>=2.4.0",
        "transformers>=4.40.0",
        "huggingface_hub",
        "accelerate",
        "safetensors",
        "fastapi[standard]",
    )
)

app = modal.App("flux-gen", image=image)

pipe = None


@app.function(
    gpu="T4",
    scaledown_window=300,
    timeout=600,
)
@modal.fastapi_endpoint(method="POST")
def generate(request):
    """Generate image from prompt using FLUX.1-schnell"""
    from fastapi import Request
    import json

    data = request.json()
    prompt = data.get("prompt", "") or data.get("p", "")
    width = data.get("width", 1024)
    height = data.get("height", 1024)
    steps = data.get("steps", 28)
    guidance = data.get("guidance", 3.0)

    if not prompt:
        return {"error": "No prompt provided"}

    global pipe
    try:
        if pipe is None:
            print("Loading FLUX.1-schnell...")
            from diffusers import FluxPipeline
            import torch

            pipe = FluxPipeline.from_pretrained(
                "black-forest-labs/FLUX.1-schnell",
                torch_dtype=torch.float16,
            )
            pipe.enable_model_cpu_offload()
            print("Model ready!")

        print(f"Generating: {prompt[:50]}...")
        result = pipe(
            prompt,
            height=height,
            width=width,
            num_inference_steps=steps,
            guidance_scale=guidance,
            max_sequence_length=256,
        ).images[0]

        buffer = io.BytesIO()
        result.save(buffer, format="PNG")
        img_b64 = base64.b64encode(buffer.getvalue()).decode()

        return {
            "success": True,
            "image": f"data:image/png;base64,{img_b64}",
            "prompt": prompt,
        }

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}