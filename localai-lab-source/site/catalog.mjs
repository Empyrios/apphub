// Curated Ollama catalog snapshot, checked 2026-11-02.
// downloadGB = Ollama's displayed file size in decimal gigabytes, NOT GPU RAM usage.
// Tags and published sizes can change. See model.source for the authoritative current listing.
export const CATALOG_DATE = '2026-11-02';
export const MODELS = Object.freeze([
  {id:'qwen3-06',family:'Qwen 3',tag:'qwen3:0.6b',name:'Qwen 3 · 0.6B',params:0.6,downloadGB:0.523,contextMax:40960,tasks:['fast','general'],vision:false,description:'Tiny, responsive text model. Good for testing your local setup and simple rewrites.',source:'https://ollama.com/library/qwen3'},
  {id:'qwen3-17',family:'Qwen 3',tag:'qwen3:1.7b',name:'Qwen 3 · 1.7B',params:1.7,downloadGB:1.4,contextMax:40960,tasks:['fast','general'],vision:false,description:'Compact everyday assistant for summarising, drafting and quick experiments.',source:'https://ollama.com/library/qwen3'},
  {id:'qwen3-4',family:'Qwen 3',tag:'qwen3:4b',name:'Qwen 3 · 4B',params:4,downloadGB:2.5,contextMax:262144,tasks:['coding','general','reasoning'],vision:false,description:'Small reasoning-capable text model, a practical starting point for local coding tests.',source:'https://ollama.com/library/qwen3'},
  {id:'qwen3-8',family:'Qwen 3',tag:'qwen3:8b',name:'Qwen 3 · 8B',params:8,downloadGB:5.2,contextMax:40960,tasks:['coding','general','reasoning'],vision:false,description:'Useful all-rounder for text, structured tasks and reasoning when memory allows.',source:'https://ollama.com/library/qwen3'},
  {id:'qwen3-14',family:'Qwen 3',tag:'qwen3:14b',name:'Qwen 3 · 14B',params:14,downloadGB:9.3,contextMax:40960,tasks:['coding','reasoning'],vision:false,description:'Larger text model. Often needs hybrid offloading on mainstream gaming cards.',source:'https://ollama.com/library/qwen3'},
  {id:'qwen3-32',family:'Qwen 3',tag:'qwen3:32b',name:'Qwen 3 · 32B',params:32,downloadGB:20,contextMax:40960,tasks:['coding','reasoning'],vision:false,description:'Memory-heavy reasoning model for high-RAM or high-VRAM setups.',source:'https://ollama.com/library/qwen3'},
  {id:'gemma3-1',family:'Gemma 3',tag:'gemma3:1b',name:'Gemma 3 · 1B',params:1,downloadGB:0.806,contextMax:32768,tasks:['fast','general'],vision:false,description:'Lightweight text model for low-memory hardware.',source:'https://ollama.com/library/gemma3'},
  {id:'gemma3-4',family:'Gemma 3',tag:'gemma3:4b',name:'Gemma 3 · 4B',params:4,downloadGB:3.4,contextMax:131072,tasks:['vision','general'],vision:true,description:'Small multimodal model for asking questions about images and ordinary text.',source:'https://ollama.com/library/gemma3'},
  {id:'gemma3-12',family:'Gemma 3',tag:'gemma3:12b',name:'Gemma 3 · 12B',params:12,downloadGB:8.2,contextMax:131072,tasks:['vision','general','reasoning'],vision:true,description:'Larger multimodal model. Usually beyond 8GB cards at common contexts.',source:'https://ollama.com/library/gemma3'},
  {id:'gemma3-27',family:'Gemma 3',tag:'gemma3:27b',name:'Gemma 3 · 27B',params:27,downloadGB:17,contextMax:131072,tasks:['vision','reasoning'],vision:true,description:'Heavy vision/text model for machines with substantial memory.',source:'https://ollama.com/library/gemma3'},
  {id:'llama32-1',family:'Llama 3.2',tag:'llama3.2:1b',name:'Llama 3.2 · 1B',params:1,downloadGB:1.3,contextMax:131072,tasks:['fast','general'],vision:false,description:'Compact Meta text model for basic assistant tasks.',source:'https://ollama.com/library/llama3.2'},
  {id:'llama32-3',family:'Llama 3.2',tag:'llama3.2:3b',name:'Llama 3.2 · 3B',params:3,downloadGB:2,contextMax:131072,tasks:['fast','general'],vision:false,description:'Simple, relatively light general-purpose text assistant.',source:'https://ollama.com/library/llama3.2'},
  {id:'phi4-14',family:'Phi-4',tag:'phi4:14b',name:'Phi-4 · 14B',params:14,downloadGB:9.1,contextMax:16384,tasks:['reasoning','general'],vision:false,description:'14B text model. Expect hybrid or CPU loading on smaller GPUs.',source:'https://ollama.com/library/phi4'}
]);
export const PRESETS = Object.freeze([
  {id:'pc',name:'Your RTX 3070 PC',gpu:'NVIDIA RTX 3070',vramGB:8,ramGB:16,cpu:'Intel i7-10700K',note:'16 GB RAM is an editable assumption: your PC memory was not provided.'},
  {id:'laptop',name:'32GB laptop · integrated',gpu:'Integrated graphics',vramGB:0,ramGB:32,cpu:'Laptop CPU',note:'No dedicated VRAM assumed; CPU inference can be slow.'},
  {id:'mid',name:'12GB gaming GPU',gpu:'Dedicated GPU',vramGB:12,ramGB:32,cpu:'Modern CPU',note:'Example upgrade comparison, not a specific product.'},
  {id:'high',name:'24GB workstation',gpu:'Dedicated GPU',vramGB:24,ramGB:64,cpu:'Modern CPU',note:'Example high-memory workstation configuration.'}
]);
export const USE_CASES = Object.freeze([
  ['all','All models'],['coding','Coding'],['reasoning','Reasoning'],['vision','Images'],['fast','Low memory'],['general','Everyday']
]);
