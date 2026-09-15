import type { ReactNode } from "react";

import type { SectionRow, SiteSettingsRow } from "@/lib/cms/database.types";
import type { Locale } from "@/lib/i18n";

import { AboutProfileSection } from "./sections/about";
import {
  CardGridSection,
  CaseCardsSection,
  ChambersInfoSection,
  CountersSection,
  CustomCtaSection,
  CustomHtmlSection,
  DoctorHeroSection,
  EmergencyStripSection,
  FaqSection,
  ImageTextSection,
  LinksSection,
  ReviewsPanelSection,
  RichTextSection,
  ServicesGridSection,
  VideoEmbedSection,
} from "./sections/blocks";
import {
  BlogsIndexSection,
  BlogsLatestSection,
  GallerySection,
  TreatmentsIndexSection,
  VideosIndexSection,
  VideosLatestSection,
} from "./sections/dynamic";
import { AppointmentFormSection, ContactFormSection } from "./sections/forms";
import {
  ChambersSection,
  CtaBannerSection,
  HeroSection,
  StatsVideoSection,
  TreatmentsPreviewSection,
} from "./sections/home";
import { LegalCardsSection } from "./sections/legal";
import { sa, sl, sx, type SectionData, type SectionProps } from "./sections/shared";
import { TestimonialsSlider } from "./sections/testimonials";

/** The slider is a client component, so it gets its plain props here. */
function TestimonialsSection({ data, locale }: SectionProps) {
  return (
    <TestimonialsSlider
      anchor={sx(data, "anchor")}
      badge={sl(data, "badge", locale)}
      heading={sl(data, "heading", locale)}
      items={sa(data, "items").map((item) => ({
        text: sl(item, "text", locale),
        name: sl(item, "name", locale),
        address: sl(item, "address", locale),
      }))}
    />
  );
}

type SectionComponent = (props: SectionProps) => ReactNode | Promise<ReactNode>;

/**
 * Maps a section `type` stored in the database to its React component. Keep in
 * step with `SECTION_DEFS` in `src/lib/cms/sections.ts`.
 */
const RENDERERS: Record<string, SectionComponent> = {
  // Home
  hero: HeroSection,
  stats_video: StatsVideoSection,
  treatments_preview: TreatmentsPreviewSection,
  chambers: ChambersSection,
  testimonials: TestimonialsSection,
  videos_latest: VideosLatestSection,
  blogs_latest: BlogsLatestSection,
  cta_banner: CtaBannerSection,

  // Page content
  about_profile: AboutProfileSection,
  treatments_index: TreatmentsIndexSection,
  videos_index: VideosIndexSection,
  blogs_index: BlogsIndexSection,
  legal_cards: LegalCardsSection,

  // Blocks
  rich_text: RichTextSection,
  image_text: ImageTextSection,
  card_grid: CardGridSection,
  faq: FaqSection,
  custom_cta: CustomCtaSection,
  gallery: GallerySection,
  video_embed: VideoEmbedSection,
  counters: CountersSection,
  links: LinksSection,
  doctor_hero: DoctorHeroSection,
  emergency_strip: EmergencyStripSection,
  case_cards: CaseCardsSection,
  reviews_panel: ReviewsPanelSection,
  chambers_info: ChambersInfoSection,
  services_grid: ServicesGridSection,
  custom_html: CustomHtmlSection,

  // Forms
  appointment_form: AppointmentFormSection,
  contact_form: ContactFormSection,
};

export function SectionRenderer({
  sections,
  locale,
  settings,
}: {
  sections: SectionRow[];
  locale: Locale;
  settings: SiteSettingsRow;
}) {
  return (
    <>
      {sections.map((section) => {
        const Component = RENDERERS[section.type] as
          | ((props: SectionProps) => ReactNode)
          | undefined;

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            return (
              <div
                key={section.id}
                className="max-container my-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800"
              >
                Unknown section type <code className="font-mono">{section.type}</code>. Add a
                renderer in <code className="font-mono">section-renderer.tsx</code>.
              </div>
            );
          }
          return null;
        }

        return (
          <Component
            key={section.id}
            sectionId={section.id}
            data={(section.data ?? {}) as SectionData}
            locale={locale}
            settings={settings}
          />
        );
      })}
    </>
  );
}
