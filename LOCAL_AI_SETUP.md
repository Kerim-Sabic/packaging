# Local AI setup and observed hardware

## Verified artifact

- Official model: [Qwen/Qwen3-8B-GGUF](https://huggingface.co/Qwen/Qwen3-8B-GGUF).
- Official file: `Qwen3-8B-Q5_K_M.gguf`, verified in the repository API before downloading; 5,851,112,224 bytes.
- License shown by the official model card: Apache-2.0. Preserve upstream notices when redistributing weights. Weights are not committed or included in the offline ZIP.
- [Artifact download](https://huggingface.co/Qwen/Qwen3-8B-GGUF/resolve/main/Qwen3-8B-Q5_K_M.gguf). The model card documents llama.cpp compatibility and non-thinking mode.
- Runtime found on this workstation: `llama-server` 0.4.1-dev, build 11026, commit `b49650adb`, Clang 20.1.8 Windows x86_64. Installed through WinGet; [primary runtime source](https://github.com/ggml-org/llama.cpp).

This runtime exposes Vulkan devices, not CUDA. Reusing it avoided driver/global changes and another runtime download. No CUDA inference claim is made.

## Actual tested configuration — 26 September 2026

Windows workstation with two NVIDIA GeForce RTX 5080 cards, about 16 GB each. NVIDIA driver 591.86; nvidia-smi reports CUDA capability 13.1. Node 22.18.0; Python 3.12.10. About 105.9 GB free disk before the download. The model was loaded on **Vulkan0, one RTX 5080**, `--split-mode none`, `--main-gpu 0`, `--gpu-layers 99`. GPU 0 used about 8.7 GB including the desktop during testing; GPU 1 stayed around 0.37 GB. Memory is not pooled. No dual-GPU split or CPU-offloaded large-model profile was tested.

Context 8,192 tokens; one parallel slot; reasoning off; temperature 0.1; maximum output 3,000 tokens/request; bounded page chunks. Model log observed generation around 106–112 tokens/s on the first fixture attempt; this is an observation, not a performance benchmark or guarantee.

Real inference ran. The initial prompt incorrectly produced not_found statuses for stated values. Prompt v1.3 added status definitions and examples, without changing model or downloading another checkpoint. The subsequent two-document fixture passed all compact extraction checks (26 proposals). That exact result is saved in `public/demo/extraction-recorded.json`. It is explicitly labelled as recorded in the UI. No general accuracy percentage is inferred.

## Configuration

Copy `.env.example` to `.env` (setup does this if absent). Set `MODEL_PATH` to an explicit existing compatible model path. Do not download a duplicate. This build's defaults are:

```dotenv
MODEL_PATH=models/Qwen3-8B-Q5_K_M.gguf
LLAMA_SERVER=llama-server.exe
MODEL_DEVICE=Vulkan0
MODEL_ID=Qwen3-8B-Q5_K_M
MODEL_URL=http://127.0.0.1:8080
```

If weights are missing and you want live extraction, download the single verified artifact:

```powershell
New-Item -ItemType Directory -Force models
curl.exe -L --fail --output models/Qwen3-8B-Q5_K_M.gguf https://huggingface.co/Qwen/Qwen3-8B-GGUF/resolve/main/Qwen3-8B-Q5_K_M.gguf
./scripts/start.ps1
```

The weights are already downloaded in the delivered local working directory. The Git repository does not contain them. `start.ps1` loads only an existing explicit/default path. It does not download models. It starts only missing services. `-NoModel` skips model startup. If reusing another model/runtime, verify its identity, license, template, supported flags and a fixture result before relying on it; update MODEL_ID so caches cannot masquerade as another model.

Equivalent tested model flags:

```text
llama-server -m <absolute-model-path> --alias Qwen3-8B-Q5_K_M --host 127.0.0.1 --port 8080 --ctx-size 8192 --parallel 1 --gpu-layers 99 --device Vulkan0 --split-mode none --main-gpu 0 --reasoning off --cors-origins http://127.0.0.1:8000 --no-webui
```

For a different installed CUDA build, inspect `--version`, `--help`, `--list-devices` and free VRAM first. Do not copy the Vulkan device name to CUDA. No CUDA workstation profile is validated by this submission.

## Health, privacy, fallback

`http://127.0.0.1:8080/health` is model health. `http://127.0.0.1:8000/health` reports `service: packproof` and `aiReady`. All services bind loopback. Backend browser origins are restricted to 127.0.0.1:4173 and :5173. Model CORS is restricted; its web UI is disabled. The adapter rejects non-loopback MODEL_URL. No tools or commands are exposed to the model. Document content is untrusted and displayed as text, never unsafe HTML.

Documents do not leave the machine. Internet was used for dependencies, the official model download and deliberate primary-source verification. Uploaded files are processed in memory; extracted text/results are stored locally in `.local/cache` and browser proposal storage. Clear both through the UI. Model weights and caches are outside Git. No full document text is logged by default.

If inference fails, use pasted/searchable text or manual entry; the app and pitch still work. The extraction result retains readable extracted pages on inference errors. On another laptop use the offline ZIP and labelled replay. OCR is deliberately not installed; scanned/empty pages produce an actionable message and are marked unprocessed. PDF processing is bounded but not a hardened hostile-file sandbox.
