"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle, XCircle, Loader2,
  Trash2, ChevronRight, BookOpen, AlertCircle, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { uploadAPI, DocumentMetadata } from "@/lib/api";

interface UploadingFile {
  id: string;
  file: File;
  uploadProgress: number;
  status: "uploading" | "processing" | "completed" | "failed";
  processingProgress: number;
  error?: string;
  docId?: string;
  chunks?: number;
  pages?: number;
}

export default function UploadPage() {
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  

  // Load existing documents
  const loadDocuments = useCallback(async () => {
    try {
      const res = await uploadAPI.listDocuments();
      setDocuments(res.data.documents || []);
    } catch (e) {
      // backend may not be running
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  // Poll processing status
  useEffect(() => {
    const processing = uploads.filter(u => u.status === "processing" && u.docId);
    if (!processing.length) return;

    const interval = setInterval(async () => {
      for (const upload of processing) {
        if (!upload.docId) continue;
        try {
          const res = await uploadAPI.getStatus(upload.docId);
          const data = res.data;
          setUploads(prev => prev.map(u =>
            u.id === upload.id ? {
              ...u,
              processingProgress: data.progress,
              status: data.status === "completed" ? "completed" :
                      data.status === "failed" ? "failed" : "processing",
              chunks: data.chunks_created,
              pages: data.total_pages,
              error: data.error_message,
            } : u
          ));
          if (data.status === "completed") {
            toast.success(`"${upload.file.name}" processed successfully!`);
            loadDocuments();
          } else if (data.status === "failed") {
            toast.error(`Failed to process "${upload.file.name}"`);
          }
        } catch {}
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [uploads, loadDocuments]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const uploadEntry: UploadingFile = {
        id, file,
        uploadProgress: 0,
        status: "uploading",
        processingProgress: 0,
      };
      setUploads(prev => [...prev, uploadEntry]);

      try {
        const res = await uploadAPI.uploadFile(file, (pct) => {
          setUploads(prev => prev.map(u => u.id === id ? { ...u, uploadProgress: pct } : u));
        });
        const { document_id } = res.data;
        setUploads(prev => prev.map(u =>
          u.id === id ? { ...u, status: "processing", docId: document_id, uploadProgress: 100 } : u
        ));
        toast.success(`"${file.name}" uploaded. Processing started...`);
      } catch (e: any) {
        setUploads(prev => prev.map(u =>
          u.id === id ? { ...u, status: "failed", error: e.message } : u
        ));
        toast.error(`Upload failed: ${e.message}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 100 * 1024 * 1024,
  });

  const handleDelete = async (docId: string, filename: string) => {
    try {
      await uploadAPI.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.document_id !== docId));
      toast.success(`"${filename}" deleted`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const statusColor: Record<string, string> = {
    uploading: "#d4a853", processing: "#00897b",
    completed: "#689f38", failed: "#e57373",
  };

  const statusLabel: Record<string, string> = {
    uploading: "Uploading...", processing: "Processing...",
    completed: "Ready", failed: "Failed",
  };

  return (
    <div
          className="page-container bg-grid relative min-h-screen"
          style={{
            backgroundImage: "url('/image/ayurveda.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* ADD THIS NEW LINE RIGHT HERE */}
     <div className="absolute inset-0 bg-black/60" />
     <div className="relative z-10" />   
      <div className="main-content" style={{ maxWidth: 1100 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="heading-serif" style={{ fontSize: "2rem", marginBottom: 8 }}>
            Upload <span className="text-gradient">Knowledge Base</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
            Add Ayurvedic texts, research papers, or any PDF. The AI will answer only from these documents.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
            {/* Left: Upload Area */}
            <div>
              {/* Drop Zone */}
              <div {...getRootProps()} className={`drop-zone ${isDragActive ? "active" : ""}`}>
                <input {...getInputProps()} />
                <motion.div animate={{ scale: isDragActive ? 1.05 : 1 }} transition={{ duration: 0.2 }}>
                  <Upload
                    size={48}
                    style={{ color: isDragActive ? "var(--teal-400)" : "var(--text-muted)", margin: "0 auto 16px", display: "block" }}
                  />
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
                    {isDragActive ? "Drop files here..." : "Drag & drop Ayurveda documents"}
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 16 }}>
                    or click to browse files
                  </p>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {["PDF", "TXT", "DOCX", "PNG", "JPG"].map(fmt => (
                      <span key={fmt} className="tag-pill" style={{ fontSize: "0.75rem" }}>.{fmt.toLowerCase()}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 12 }}>
                    Max file size: 100 MB
                  </p>
                </motion.div>
              </div>

              {/* Active Uploads */}
              <AnimatePresence>
                {uploads.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 24 }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Current Uploads
                    </h3>
                    {uploads.map((upload) => (
                      <motion.div
                        key={upload.id}
                        className="glass-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ padding: "16px", marginBottom: 12 }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <FileText size={18} style={{ color: "var(--teal-400)", flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {upload.file.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {(upload.file.size / (1024*1024)).toFixed(2)} MB
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: statusColor[upload.status], fontSize: "0.8rem", fontWeight: 600 }}>
                            {upload.status === "uploading" || upload.status === "processing"
                              ? <Loader2 size={14} className="animate-spin" />
                              : upload.status === "completed" ? <CheckCircle size={14} />
                              : <XCircle size={14} />}
                            {statusLabel[upload.status]}
                          </div>
                        </div>

                        {/* Progress */}
                        {upload.status === "uploading" && (
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${upload.uploadProgress}%` }} />
                          </div>
                        )}
                        {upload.status === "processing" && (
                          <>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${upload.processingProgress}%` }} />
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                              {upload.processingProgress}% — embedding & indexing...
                            </div>
                          </>
                        )}
                        {upload.status === "completed" && (
                          <div style={{ fontSize: "0.8rem", color: "#8bc34a", marginTop: 4 }}>
                            ✓ {upload.pages} pages · {upload.chunks} chunks indexed
                          </div>
                        )}
                        {upload.status === "failed" && (
                          <div style={{ fontSize: "0.8rem", color: "#ef9a9a", marginTop: 4 }}>
                            ⚠ {upload.error || "Processing failed"}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Sidebar — Info + Docs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Info card */}
              <div className="glass-card" style={{ padding: 20 }}>
                <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "1rem", marginBottom: 12, color: "var(--teal-300)" }}>
                  Processing Pipeline
                </h3>
                {[
                  "1. Text extracted from PDF",
                  "2. Content cleaned & split",
                  "3. Embeddings generated",
                  "4. Stored in ChromaDB",
                  "5. Ready for Q&A",
                ].map((step) => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: "0.83rem", color: "var(--text-secondary)" }}>
                    <ChevronRight size={12} style={{ color: "var(--teal-500)" }} />
                    {step}
                  </div>
                ))}
              </div>

              {/* Document count */}
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "1rem", color: "var(--teal-300)" }}>
                    Processed ({documents.filter(d => d.status === "completed").length})
                  </h3>
                  <button onClick={loadDocuments} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    <RefreshCw size={14} />
                  </button>
                </div>
                {loadingDocs ? (
                  <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                    {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
                  </div>
                ) : documents.length === 0 ? (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>
                    No documents yet
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {documents.map((doc) => (
                      <div key={doc.document_id} className="source-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: "0.82rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {doc.filename}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>
                            {doc.total_pages}p · {doc.total_chunks} chunks
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(doc.document_id, doc.filename)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#e57373", marginLeft: 8, padding: 4 }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
