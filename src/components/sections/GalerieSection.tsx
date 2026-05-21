'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Media {
  id: string;
  type: 'PHOTO' | 'VIDEO';
  url: string;
  miniature: string | null;
  titre: string;
  edition: string | null;
}

// Extract YouTube embed URL from regular URL
function getYoutubeEmbed(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

export default function GalerieSection() {
  const [medias, setMedias] = useState<Media[]>([]);
  const [selected, setSelected] = useState<Media | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PHOTO' | 'VIDEO'>('ALL');

  useEffect(() => {
    fetch('/api/galerie')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setMedias(d))
      .catch(() => {});
  }, []);

  if (medias.length === 0) return null;

  const filtered = medias.filter((m) => filter === 'ALL' || m.type === filter);

  return (
    <section className="py-16 px-4" id="galerie">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-black text-white mb-3">
            Nos <span className="gradient-text">Éditions</span>
          </h2>
          <p className="text-gray-500 text-sm">Revivez les meilleurs moments des éditions précédentes</p>

          <div className="flex items-center justify-center gap-2 mt-6">
            {[
              { value: 'ALL', label: 'Tout' },
              { value: 'PHOTO', label: '📷 Photos' },
              { value: 'VIDEO', label: '🎬 Vidéos' },
            ].map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value as any)}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${filter === f.value ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              viewport={{ once: true }}
              onClick={() => setSelected(m)}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-black/50"
            >
              {m.miniature || m.type === 'PHOTO' ? (
                <img
                  src={m.miniature || m.url}
                  alt={m.titre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-5xl">🎬</div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
              {m.type === 'VIDEO' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-80">
                  <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center text-white text-xl">▶</div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">{m.titre}</p>
                {m.edition && <p className="text-gray-400 text-xs">{m.edition}</p>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-bold">{selected.titre}</p>
                    {selected.edition && <p className="text-gray-500 text-xs">{selected.edition}</p>}
                  </div>
                  <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-2xl">✕</button>
                </div>
                {selected.type === 'PHOTO' ? (
                  <img src={selected.url} alt={selected.titre} className="w-full max-h-[70vh] object-contain rounded-2xl" />
                ) : (
                  <div className="aspect-video rounded-2xl overflow-hidden">
                    {getYoutubeEmbed(selected.url) ? (
                      <iframe
                        src={getYoutubeEmbed(selected.url)!}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={selected.url} controls className="w-full h-full" />
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
