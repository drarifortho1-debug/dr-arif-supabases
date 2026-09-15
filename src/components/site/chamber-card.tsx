import { ArrowUpRight, MapPin } from "lucide-react";

import { SafeImage } from "@/components/site/ui";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { telHref } from "@/lib/image";
import { cn } from "@/lib/utils";

export type ChamberTheme = "red" | "green" | "blue";

const THEMES: Record<
  ChamberTheme,
  { card: string; logo: string; schedule: string; button: string }
> = {
  red: {
    card: "bg-red-600/15",
    logo: "-ml-3.5",
    schedule: "bg-red-50",
    button: "bg-red-400 text-white",
  },
  green: {
    card: "bg-green-600/15",
    logo: "-ml-0.5",
    schedule: "bg-green-50",
    button: "bg-green-700 text-white",
  },
  blue: {
    card: "bg-blue-light/15",
    logo: "",
    schedule: "bg-blue-50",
    button: "bg-blue-light text-white",
  },
};

export function ChamberCard({
  locale,
  logo,
  name,
  address,
  days,
  time,
  offDays,
  mapUrl,
  phone1,
  phone2,
  theme = "blue",
}: {
  locale: Locale;
  logo?: string;
  name: string;
  address: string;
  days: string;
  time: string;
  offDays: string;
  mapUrl?: string;
  phone1?: string;
  phone2?: string;
  theme?: ChamberTheme;
}) {
  const dict = getDictionary(locale);
  const styles = THEMES[theme] ?? THEMES.blue;

  return (
    <div
      className={cn(
        "flex min-h-95 flex-col justify-between rounded-3xl p-7 shadow-[0_4px_20px_-4px_rgba(148,163,184,0.06)] transition-all duration-300 hover:shadow-[0_12px_30px_-6px_rgba(13,148,136,0.08)]",
        styles.card,
      )}
    >
      <div className="space-y-7">
        <div className="flex flex-col items-center gap-1.5">
          {logo ? (
            <SafeImage
              src={logo}
              alt={name}
              width={200}
              height={200}
              className={cn("h-22 w-auto", styles.logo)}
            />
          ) : null}
          <h3 className="text-xl font-semibold text-blue-dark">{name}</h3>
        </div>

        <div className={cn("rounded-2xl p-5", styles.schedule)}>
          <div>
            <p className="mb-0.5 text-xs font-medium text-slate-600">{dict.chamberDays}</p>
            <h5 className="text-base font-semibold text-blue-dark">{days}</h5>
          </div>
          <div className="mt-3">
            <p className="mb-0.5 text-xs font-medium text-slate-600">{dict.chamberTime}</p>
            <p className="text-base font-semibold text-blue-dark">{time}</p>
          </div>
          <div className="mt-3">
            <p className="mb-0.5 text-xs font-medium text-slate-600">{dict.chamberOff}</p>
            <p className="font-medium text-rose-600">{offDays}</p>
          </div>
          {phone1 || phone2 ? (
            <div className="mt-3 border-t border-slate-200 pt-5">
              <p className="mb-2 text-xs font-medium text-slate-600">{dict.chamberSerial}</p>
              {phone1 ? (
                <a
                  href={telHref(phone1)}
                  dir="ltr"
                  className="block font-google-sans font-semibold text-blue-dark hover:text-blue-600"
                >
                  {phone1}
                </a>
              ) : null}
              {phone2 ? (
                <a
                  href={telHref(phone2)}
                  dir="ltr"
                  className="block font-google-sans font-semibold text-blue-dark hover:text-blue-600"
                >
                  {phone2}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        {address ? (
          <div className="flex gap-3 pt-2">
            <MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden />
            <p>{address}</p>
          </div>
        ) : null}
      </div>

      {mapUrl ? (
        <div className="mt-7">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold transition-all duration-200",
              styles.button,
            )}
          >
            <span>{dict.viewOnMap}</span>
            <ArrowUpRight size={18} aria-hidden />
          </a>
        </div>
      ) : null}
    </div>
  );
}
