
import React, { useState, useCallback, useRef } from 'react';
import { XIcon, UploadCloudIcon } from './icons';

// Make TS aware of the global libs from the CDN
declare const pdfjsLib: any;
declare const Readability: any;

interface SourceModalProps {
  onClose: () => void;
  onAddSource: (title: string, content: string) => void;
}

const SourceModal: React.FC<SourceModalProps> = ({ onClose, onAddSource }) => {
  type SourceType = 'text' | 'url' | 'file';
  const [sourceType, setSourceType] = useState<SourceType>('text');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
      setIsLoading(false);
      setError('');
  };

  const handleUrlFetch = useCallback(async () => {
    if (!urlInput.trim()) return;
    resetState();
    setIsLoading(true);
    
    // Using a public CORS proxy to fetch web content from the client-side.
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlInput)}`;
    
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Failed to fetch URL: ${response.statusText}`);
        
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        // Fix for "Cannot assign to 'baseURI' because it is a read-only property."
        // Set document URI for Readability to resolve relative links by adding a <base> element.
        const base = doc.createElement('base');
        base.href = urlInput;
        doc.head.appendChild(base);

        const reader = new Readability(doc);
        const article = reader.parse();

        if (article && article.content) {
            setTitle(article.title);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.content;
            setContent(tempDiv.textContent || tempDiv.innerText || '');
        } else {
            throw new Error("Could not extract article content.");
        }
    } catch (e: any) {
        setError(`Failed to process URL: ${e.message}. Some websites may not be compatible.`);
    } finally {
        setIsLoading(false);
    }
  }, [urlInput]);

  const processPdf = useCallback(async (file: File) => {
    resetState();
    setIsLoading(true);
    setTitle(file.name.replace(/\.pdf$/i, ''));

    const reader = new FileReader();
    reader.onload = async (event) => {
        if (!event.target?.result) {
            setError('Failed to read file.');
            setIsLoading(false);
            return;
        }
        try {
            const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n\n';
            }
            setContent(fullText.trim());
        } catch (e: any) {
            setError(`Failed to parse PDF: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    reader.onerror = () => {
        setError('Error reading file.');
        setIsLoading(false);
    }
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        if(files[0].type === 'application/pdf') {
            processPdf(files[0]);
        } else {
            setError('Invalid file type. Please drop a PDF file.');
        }
    }
  }, [processPdf]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if(files[0].type === 'application/pdf') {
            processPdf(files[0]);
        } else {
            setError('Invalid file type. Please select a PDF file.');
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onAddSource(title.trim(), content.trim());
      onClose();
    }
  };

  const handleTabClick = (type: SourceType) => {
      setSourceType(type);
      setError('');
  }

  const tabClasses = (type: SourceType) => 
    `px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none -mb-px border-b-2 ${
      sourceType === type 
      ? 'border-blue-500 text-white' 
      : 'border-transparent text-gray-400 hover:text-white'
    }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Add New Source</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button type="button" onClick={() => handleTabClick('text')} className={tabClasses('text')}>Paste Text</button>
                <button type="button" onClick={() => handleTabClick('url')} className={tabClasses('url')}>Web Link</button>
                <button type="button" onClick={() => handleTabClick('file')} className={tabClasses('file')}>Upload PDF</button>
              </nav>
            </div>

            <div className="mt-6">
              {sourceType === 'url' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-grow bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/article"
                  />
                  <button type="button" onClick={handleUrlFetch} disabled={isLoading || !urlInput.trim()} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50">
                    {isLoading ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>
              )}
              {sourceType === 'file' && (
                 <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${isDragOver ? 'border-blue-500 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'}`}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="application/pdf" className="hidden" />
                    <UploadCloudIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-400">
                        <span className="font-semibold text-blue-400">Click to upload</span> or drag and drop a PDF
                    </p>
                </div>
              )}
            </div>

             {isLoading && <div className="mt-4 text-center text-gray-400">Processing...</div>}
             {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}

            <div className="space-y-4 mt-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={sourceType === 'text' ? 'e.g., Photosynthesis Notes' : 'Title will be populated automatically'}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => {
                      if (sourceType === 'text') {
                        setContent(e.target.value);
                      }
                    }}
                    readOnly={sourceType !== 'text'}
                    rows={sourceType === 'text' ? 10 : 5}
                    className={`w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${sourceType !== 'text' ? 'cursor-not-allowed opacity-70' : ''}`}
                    placeholder={sourceType === 'text' ? 'Paste your article, notes, or any text here...' : 'Content will be populated automatically'}
                    required
                  />
                </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50"
              disabled={!title.trim() || !content.trim() || isLoading}
            >
              Add Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SourceModal;
