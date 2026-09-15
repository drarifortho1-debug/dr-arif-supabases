"use client";

import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useRef } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

export interface TestimonialItem {
  text: string;
  name: string;
  address: string;
}

export function TestimonialsSlider({
  anchor,
  badge,
  heading,
  items,
}: {
  anchor?: string;
  badge?: string;
  heading?: string;
  items: TestimonialItem[];
}) {
  const swiperRef = useRef<SwiperType | null>(null);

  if (items.length === 0) return null;

  return (
    <section
      id={anchor || undefined}
      className="w-full overflow-hidden border-t border-slate-100 bg-white py-24 md:py-32"
    >
      <div className="max-container">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 border-b border-slate-200/80 pb-12 text-left md:flex-row md:items-end">
          <div className="max-w-xl space-y-4">
            {badge ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-light/20 bg-blue-light/10 px-3 py-1 text-sm font-bold uppercase tracking-wider text-blue-light">
                {badge}
              </div>
            ) : null}
            <h2 className="text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">
              {heading}
            </h2>
          </div>

          <div className="flex shrink-0 gap-2.5">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              className="flex size-10 cursor-pointer items-center justify-center rounded-md border border-black/5 bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95"
              aria-label="Previous"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              className="flex size-10 cursor-pointer items-center justify-center rounded-md border border-black/5 bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95"
              aria-label="Next"
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="w-full overflow-hidden px-0.5">
          <Swiper
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            modules={[Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="w-full overflow-clip! py-2 sm:overflow-visible!"
          >
            {items.map((item, index) => (
              <SwiperSlide key={index} className="h-auto">
                <div className="flex min-h-70 flex-col justify-between rounded-2xl bg-slate-50 p-7 text-left">
                  <div className="space-y-4 overflow-hidden">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                      ))}
                    </div>
                    <p className="line-clamp-4 font-medium leading-relaxed text-slate-600">“{item.text}”</p>
                  </div>
                  <div className="mt-auto border-t border-slate-200/50 pt-4">
                    <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
                    <p className="mt-0.5 text-xs font-medium text-slate-400">{item.address}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
