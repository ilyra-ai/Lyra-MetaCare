import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;

let generator: any = null;

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // We use a relatively small text generation model.
    // In actual production healthcare it would be quantized Llama3 or Gemma, but this runs locally in browser.
    if (!generator) {
        self.postMessage({ status: 'loading', message: 'Loading model (this might take a few moments)...' });
        generator = await pipeline('text-generation', 'Xenova/TinyLlama-1.1B-Chat-v1.0', {
            dtype: 'q4',
            device: 'webgpu'
        });
        self.postMessage({ status: 'ready', message: 'Model loaded successfully!' });
    }

    const { prompt } = event.data;

    try {
        self.postMessage({ status: 'generating', message: 'Generating response...' });

        const messages = [
            { role: 'system', content: 'You are an expert health advisor and Vedic Astrologer. Output JSON format.' },
            { role: 'user', content: prompt }
        ];

        const output = await generator(messages, {
            max_new_tokens: 300,
            temperature: 0.7,
            do_sample: true,
        });

        self.postMessage({ status: 'complete', result: output[0].generated_text[2].content });
    } catch (e: any) {
        self.postMessage({ status: 'error', error: e.message });
    }
});
