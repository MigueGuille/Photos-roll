"use client";

/* eslint-disable @next/next/no-img-element -- The gallery uses direct photo assets for zoom, downloads, and printing. */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

type Photo = {
  id: string;
  src: string;
  filename: string;
  title: string;
  caption: string;
  alt: string;
  shape: "portrait" | "wide" | "standard";
};

const PHOTOS: Photo[] = [
  {
    id: "together",
    src: "/photos/graduation-together.jpg",
    filename: "graduacion-01-siempre.jpg",
    title: "Siempre",
    caption: "Junto a quienes estuvieron siempre",
    alt: "Graduado acompañado durante la celebración",
    shape: "portrait",
  },
  {
    id: "group",
    src: "/photos/graduation-group.jpg",
    filename: "graduacion-02-juntos.jpg",
    title: "Juntos",
    caption: "La alegría de celebrar juntos",
    alt: "Grupo de familiares y graduados celebrando",
    shape: "wide",
  },
  {
    id: "family",
    src: "/photos/graduation-family.jpg",
    filename: "graduacion-03-orgullo.jpg",
    title: "Orgullo",
    caption: "El orgullo de compartir el camino",
    alt: "Graduado junto a un familiar",
    shape: "standard",
  },
  {
    id: "diploma",
    src: "/photos/graduation-diploma.jpg",
    filename: "graduacion-04-logro.jpg",
    title: "Logro",
    caption: "El instante que lo cambió todo",
    alt: "Graduado recibiendo su diploma en el escenario",
    shape: "wide",
  },
  {
    id: "signing",
    src: "/photos/graduation-signing.jpg",
    filename: "graduacion-05-futuro.jpg",
    title: "Futuro",
    caption: "Una firma, un nuevo comienzo",
    alt: "Graduado firmando el libro ceremonial",
    shape: "wide",
  },
  {
    id: "portrait",
    src: "/photos/graduation-portrait.jpg",
    filename: "graduacion-06-comienzo.jpg",
    title: "Comienzo",
    caption: "Retrato de una nueva etapa",
    alt: "Retrato formal del graduado con toga y medalla",
    shape: "portrait",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [notice, setNotice] = useState("");

  const siteShellRef = useRef<HTMLElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const zoomRef = useRef(1);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistanceRef = useRef(0);
  const pinchScaleRef = useRef(1);
  const dragOriginRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);
  const swipeRef = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const activePhoto = PHOTOS[activeIndex];
  const selectedPhotos = useMemo(
    () => PHOTOS.filter((photo) => selectedIds.has(photo.id)),
    [selectedIds],
  );

  const showNotice = useCallback((message: string) => {
    setNotice(message);
  }, []);

  const applyZoom = useCallback((nextZoom: number) => {
    const next = clamp(nextZoom, 1, 4);
    zoomRef.current = next;
    setZoom(next);
    if (next <= 1) setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const movePhoto = useCallback((direction: number) => {
    applyZoom(1);
    setActiveIndex(
      (current) => (current + direction + PHOTOS.length) % PHOTOS.length,
    );
  }, [applyZoom]);

  const openPhoto = useCallback((index: number) => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    applyZoom(1);
    setActiveIndex(index);
    setLightboxOpen(true);
  }, [applyZoom]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    applyZoom(1);
    pointersRef.current.clear();
    window.requestAnimationFrame(() => previousFocusRef.current?.focus());
  }, [applyZoom]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    const background = siteShellRef.current;
    const previousAriaHidden = background?.getAttribute("aria-hidden");
    document.body.style.overflow = "hidden";
    if (background) {
      background.inert = true;
      background.setAttribute("aria-hidden", "true");
    }
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const focusableElements = Array.from(
          lightboxRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => element.getClientRects().length > 0);

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;
        if (event.shiftKey && (activeElement === first || !lightboxRef.current?.contains(activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (activeElement === last || !lightboxRef.current?.contains(activeElement))) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") movePhoto(-1);
      if (event.key === "ArrowRight") movePhoto(1);
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        applyZoom(zoomRef.current + 0.35);
      }
      if (event.key === "-") {
        event.preventDefault();
        applyZoom(zoomRef.current - 0.35);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (background) {
        background.inert = false;
        if (previousAriaHidden == null) background.removeAttribute("aria-hidden");
        else background.setAttribute("aria-hidden", previousAriaHidden);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [applyZoom, closeLightbox, lightboxOpen, movePhoto]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const downloadPhoto = useCallback((photo: Photo) => {
    const link = document.createElement("a");
    link.href = photo.src;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const downloadPhotos = useCallback(
    async (photos: Photo[]) => {
      if (photos.length === 0) return;

      if (photos.length === 1) {
        downloadPhoto(photos[0]);
        showNotice("Tu fotografía está lista para descargar.");
        return;
      }

      showNotice("Preparando tu selección en un solo archivo…");

      try {
        const { zip } = await import("fflate");
        const entries: Record<string, Uint8Array> = {};

        await Promise.all(
          photos.map(async (photo) => {
            const response = await fetch(photo.src);
            if (!response.ok) throw new Error(`No se pudo cargar ${photo.filename}`);
            entries[photo.filename] = new Uint8Array(await response.arrayBuffer());
          }),
        );

        const archive = await new Promise<Uint8Array>((resolve, reject) => {
          zip(entries, { level: 0 }, (error, data) => {
            if (error) reject(error);
            else resolve(data);
          });
        });
        const archiveBuffer = archive.buffer.slice(
          archive.byteOffset,
          archive.byteOffset + archive.byteLength,
        ) as ArrayBuffer;
        const url = URL.createObjectURL(
          new Blob([archiveBuffer], { type: "application/zip" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "momentos-graduacion-seleccion.zip";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showNotice(`${photos.length} fotografías listas en un solo archivo.`);
      } catch {
        showNotice(
          "No se pudo preparar la selección. Intenta descargar las fotos individualmente.",
        );
      }
    },
    [downloadPhoto, showNotice],
  );

  const printPhotos = useCallback(
    (photos: Photo[]) => {
      if (photos.length === 0) return;
      const printWindow = window.open("", "_blank", "width=960,height=760");
      if (!printWindow) {
        showNotice("Permite las ventanas emergentes para abrir la impresión.");
        return;
      }

      printWindow.opener = null;
      const pages = photos
        .map((photo, index) => {
          const absoluteSrc = new URL(photo.src, window.location.href).href;
          return `<figure class="print-page">
            <img src="${absoluteSrc}" alt="${photo.alt}">
            <figcaption>${String(index + 1).padStart(2, "0")} · ${photo.caption}</figcaption>
          </figure>`;
        })
        .join("");

      printWindow.document.open();
      printWindow.document.write(`<!doctype html>
        <html lang="es"><head><meta charset="utf-8"><title>Momentos · Impresión</title>
        <style>
          *{box-sizing:border-box} html,body{margin:0;background:#fff;color:#233648;font-family:Arial,sans-serif}
          .print-page{height:100vh;margin:0;padding:10mm;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:4mm;page-break-after:always;break-after:page}
          .print-page:last-child{page-break-after:auto;break-after:auto}
          img{width:100%;height:100%;object-fit:contain;display:block}
          figcaption{text-align:center;font-size:10pt;letter-spacing:.08em;text-transform:uppercase}
          @page{size:auto;margin:0}
        </style></head><body>${pages}</body></html>`);
      printWindow.document.close();

      const images = Array.from(printWindow.document.images);
      Promise.all(
        images.map(
          (image) =>
            new Promise<void>((resolve) => {
              if (image.complete) resolve();
              else {
                image.onload = () => resolve();
                image.onerror = () => resolve();
              }
            }),
        ),
      ).then(() => {
        printWindow.focus();
        printWindow.print();
      });
      printWindow.onafterprint = () => printWindow.close();
    },
    [showNotice],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      pinchDistanceRef.current = Math.hypot(
        second.x - first.x,
        second.y - first.y,
      );
      pinchScaleRef.current = zoom;
      dragOriginRef.current = null;
      swipeRef.current = null;
    } else if (zoom > 1) {
      dragOriginRef.current = {
        x: event.clientX,
        y: event.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    } else {
      swipeRef.current = {
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
      };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const ratio = distance / Math.max(pinchDistanceRef.current, 1);
      applyZoom(pinchScaleRef.current * ratio);
    } else if (zoom > 1 && dragOriginRef.current) {
      const origin = dragOriginRef.current;
      setPan({
        x: origin.panX + event.clientX - origin.x,
        y: origin.panY + event.clientY - origin.y,
      });
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.size === 1 && swipeRef.current && zoom === 1) {
      const deltaX = event.clientX - swipeRef.current.x;
      const deltaY = event.clientY - swipeRef.current.y;
      const elapsed = Date.now() - swipeRef.current.time;
      if (
        elapsed < 650 &&
        Math.abs(deltaX) > 58 &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        movePhoto(deltaX > 0 ? -1 : 1);
      }
    }

    pointersRef.current.delete(event.pointerId);
    swipeRef.current = null;
    dragOriginRef.current = null;

    if (pointersRef.current.size === 1 && zoom > 1) {
      const remaining = Array.from(pointersRef.current.values())[0];
      dragOriginRef.current = {
        x: remaining.x,
        y: remaining.y,
        panX: pan.x,
        panY: pan.y,
      };
    }
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    applyZoom(zoomRef.current + (event.deltaY < 0 ? 0.25 : -0.25));
  };

  const selectionOrActive = selectedPhotos.length
    ? selectedPhotos
    : [activePhoto];

  return (
    <>
      <main ref={siteShellRef} id="top" className="site-shell">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Momentos, inicio">
            <span className="brand-mark" aria-hidden="true">M</span>
            <span>MOMENTOS.</span>
          </a>
          <nav className="header-actions" aria-label="Acciones de la fotografía activa">
            <button className="header-action" type="button" onClick={() => openPhoto(activeIndex)}>
              <span aria-hidden="true">＋</span><span className="action-label">Zoom</span>
            </button>
            <button className="header-action" type="button" onClick={() => downloadPhotos([activePhoto])}>
              <span aria-hidden="true">↓</span><span className="action-label">Descargar</span>
            </button>
            <button className="header-action" type="button" onClick={() => printPhotos([activePhoto])}>
              <span aria-hidden="true">▣</span><span className="action-label">Imprimir</span>
            </button>
          </nav>
        </header>

        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span aria-hidden="true" />Promoción 2026 · 6 fotografías</p>
            <h1 id="hero-title">Un día que queda<br />para siempre.</h1>
            <p className="hero-lede">
              Una colección íntima para revivir, compartir y conservar cada instante de la graduación.
            </p>
            <div className="hero-buttons">
              <button
                className="button button-primary"
                type="button"
                onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explorar galería <span aria-hidden="true">↘</span>
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => downloadPhotos(selectionOrActive)}
              >
                Descargar selección <span aria-hidden="true">↓</span>
              </button>
            </div>
            <div className="story-note">
              <span className="story-number">26</span>
              <span>Graduación · Una historia en seis cuadros</span>
            </div>
          </div>

          <div className="hero-collage" aria-label="Vista destacada de la colección">
            <div className="collage-shape collage-shape-blue" aria-hidden="true" />
            <div className="collage-shape collage-shape-rose" aria-hidden="true" />
            <div className="photo-print photo-print-back photo-print-left" aria-hidden="true">
              <img src={PHOTOS[1].src} alt="" />
            </div>
            <div className="photo-print photo-print-back photo-print-right" aria-hidden="true">
              <img src={PHOTOS[4].src} alt="" />
            </div>
            <button
              className="photo-print photo-print-main"
              type="button"
              onClick={() => openPhoto(activeIndex)}
              aria-label={`Ampliar: ${activePhoto.caption}`}
            >
              <img src={activePhoto.src} alt={activePhoto.alt} fetchPriority="high" />
              <span className="print-caption">
                <span><small>Recuerdo {String(activeIndex + 1).padStart(2, "0")}</small>{activePhoto.caption}</span>
                <strong>{String(activeIndex + 1).padStart(2, "0")} / 06</strong>
              </span>
            </button>
            <div className="date-sticker" aria-hidden="true">PROMOCIÓN<br />2026</div>
          </div>
        </section>

        <section id="gallery" className="gallery-section" aria-labelledby="gallery-title">
          <div className="gallery-heading">
            <div>
              <p className="section-kicker">La colección</p>
              <h2 id="gallery-title">Pequeños instantes,<br />una gran historia.</h2>
            </div>
            <div className="gallery-intro">
              <p>Abre una fotografía para verla a pantalla completa o selecciónala para descargarla e imprimirla.</p>
              <div className="selection-count" aria-live="polite">
                <span>{selectedIds.size} {selectedIds.size === 1 ? "seleccionada" : "seleccionadas"}</span>
                {selectedIds.size > 0 && (
                  <button type="button" onClick={() => setSelectedIds(new Set())}>Limpiar</button>
                )}
              </div>
            </div>
          </div>

          <div className="photo-grid">
            {PHOTOS.map((photo, index) => {
              const selected = selectedIds.has(photo.id);
              return (
                <article
                  className={`photo-card photo-card-${photo.shape}${selected ? " is-selected" : ""}`}
                  key={photo.id}
                >
                  <button
                    className="photo-open"
                    type="button"
                    onClick={() => openPhoto(index)}
                    aria-label={`Abrir fotografía ${index + 1}: ${photo.caption}`}
                  >
                    <img src={photo.src} alt={photo.alt} loading={index < 2 ? "eager" : "lazy"} decoding="async" />
                    <span className="photo-gradient" aria-hidden="true" />
                    <span className="photo-card-caption">
                      <span>{String(index + 1).padStart(2, "0")} · {photo.title}</span>
                      <small>{photo.caption}</small>
                    </span>
                  </button>
                  <button
                    className="select-photo"
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${selected ? "Quitar de" : "Añadir a"} la selección: ${photo.caption}`}
                    onClick={() => toggleSelection(photo.id)}
                  >
                    <span aria-hidden="true">{selected ? "✓" : "+"}</span>
                    <span>{selected ? "Seleccionada" : "Seleccionar"}</span>
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="site-footer">
          <span>MOMENTOS.</span>
          <p>Hecho para volver a este día, una y otra vez.</p>
          <a href="#top">Volver arriba ↑</a>
        </footer>

        {selectedIds.size > 0 && (
          <aside className="selection-dock" aria-label="Acciones para fotografías seleccionadas">
            <div>
              <strong>{selectedIds.size}</strong>
              <span>{selectedIds.size === 1 ? "foto seleccionada" : "fotos seleccionadas"}</span>
            </div>
            <div className="selection-dock-actions">
              <button type="button" onClick={() => downloadPhotos(selectedPhotos)}>↓ <span>Descargar</span></button>
              <button type="button" onClick={() => printPhotos(selectedPhotos)}>▣ <span>Imprimir</span></button>
              <button className="dock-clear" type="button" onClick={() => setSelectedIds(new Set())} aria-label="Limpiar selección">×</button>
            </div>
          </aside>
        )}
      </main>

      {lightboxOpen && (
        <div ref={lightboxRef} className="lightbox" role="dialog" aria-modal="true" aria-label={`Visor de fotografía: ${activePhoto.caption}`}>
          <header className="lightbox-header">
            <div className="lightbox-title">
              <span>{String(activeIndex + 1).padStart(2, "0")} / 06</span>
              <strong>{activePhoto.caption}</strong>
            </div>
            <div className="lightbox-actions">
              <button type="button" aria-pressed={selectedIds.has(activePhoto.id)} onClick={() => toggleSelection(activePhoto.id)}>
                {selectedIds.has(activePhoto.id) ? "✓ Seleccionada" : "+ Seleccionar"}
              </button>
              <button type="button" onClick={() => downloadPhotos([activePhoto])}>↓ <span>Descargar</span></button>
              <button type="button" onClick={() => printPhotos([activePhoto])}>▣ <span>Imprimir</span></button>
              <button ref={closeButtonRef} className="lightbox-close" type="button" onClick={closeLightbox} aria-label="Cerrar visor">×</button>
            </div>
          </header>

          <button className="lightbox-nav lightbox-prev" type="button" onClick={() => movePhoto(-1)} aria-label="Fotografía anterior">‹</button>
          <div
            className={`lightbox-stage${zoom > 1 ? " is-zoomed" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onDoubleClick={() => applyZoom(zoom > 1 ? 1 : 2)}
          >
            <img
              src={activePhoto.src}
              alt={activePhoto.alt}
              draggable={false}
              style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}
            />
          </div>
          <button className="lightbox-nav lightbox-next" type="button" onClick={() => movePhoto(1)} aria-label="Fotografía siguiente">›</button>

          <div className="zoom-controls" aria-label="Controles de zoom" aria-live="polite">
            <button type="button" onClick={() => applyZoom(zoomRef.current - 0.35)} aria-label="Alejar">−</button>
            <button type="button" className="zoom-value" onClick={() => applyZoom(1)} aria-label={`Restablecer zoom, nivel actual ${Math.round(zoom * 100)} por ciento`}>{Math.round(zoom * 100)}%</button>
            <button type="button" onClick={() => applyZoom(zoomRef.current + 0.35)} aria-label="Acercar">＋</button>
          </div>

          <div className="lightbox-strip" aria-label="Elegir fotografía">
            {PHOTOS.map((photo, index) => (
              <button
                type="button"
                key={photo.id}
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => {
                  applyZoom(1);
                  setActiveIndex(index);
                }}
                aria-label={`Ver fotografía ${index + 1}: ${photo.caption}`}
                aria-current={index === activeIndex ? "true" : undefined}
              >
                <img src={photo.src} alt="" />
              </button>
            ))}
          </div>
          <p className="lightbox-hint">Desliza para cambiar · Pellizca o usa ＋ para acercar</p>
        </div>
      )}

      <div className={`toast${notice ? " is-visible" : ""}`} role="status" aria-live="polite">
        {notice}
      </div>
    </>
  );
}
