import type { Locale } from "@/lib/i18n";

/**
 * The section registry.
 *
 * This file is the single source of truth for the page builder: the admin form
 * is generated from `fields`, and `SectionRenderer` picks the matching React
 * component by `type`. Adding a new section means adding an entry here plus a
 * renderer in `src/components/site/sections/`.
 *
 * The block set mirrors the original drarifortho.com site. Every text field is
 * localized ({ bn, en }); defaults are Bangla, English can be filled in later.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "code"
  | "image"
  | "url"
  | "number"
  | "boolean"
  | "select"
  | "icon"
  | "repeater";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  /** Stored as `{ bn: "...", en: "..." }` and edited with a locale switcher. */
  localized?: boolean;
  placeholder?: string;
  help?: string;
  options?: Array<{ value: string; label: string }>;
  /** Sub-fields, for `repeater`. */
  fields?: FieldDef[];
  /** Which sub-field to show as the row title in a repeater. */
  itemLabel?: string;
  /** Label for the repeater's add button, e.g. "Add service". */
  addLabel?: string;
  min?: number;
  max?: number;
  /** Full-width in the two-column admin form. */
  wide?: boolean;
  defaultValue?: unknown;
}

export type SectionGroup = "Home" | "Page content" | "Blocks" | "Forms";

export interface SectionDef {
  type: string;
  label: string;
  description: string;
  icon: string;
  group: SectionGroup;
  fields: FieldDef[];
}

/* ------------------------------------------------------------ helpers */

type L = Partial<Record<Locale, string>>;

/** Bangla-only default for a localized field. */
const bn = (value: string): L => ({ bn: value });

const txt = (name: string, label: string, def = "", extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type: "text",
  localized: true,
  defaultValue: bn(def),
  ...extra,
});

const area = (name: string, label: string, def = "", extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type: "textarea",
  localized: true,
  wide: true,
  defaultValue: bn(def),
  ...extra,
});

const rich = (name: string, label: string, def = "", extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type: "richtext",
  localized: true,
  wide: true,
  defaultValue: bn(def),
  ...extra,
});

const plain = (name: string, label: string, def = "", extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type: "text",
  defaultValue: def,
  ...extra,
});

const img = (name: string, label: string, def = "", extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type: "image",
  defaultValue: def,
  ...extra,
});

const link = (name: string, label: string, def = "", extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type: "url",
  defaultValue: def,
  placeholder: "/about-us, tel:+880… or https://…",
  ...extra,
});

const bool = (name: string, label: string, def = false, extra: Partial<FieldDef> = {}): FieldDef => ({
  name,
  label,
  type: "boolean",
  defaultValue: def,
  ...extra,
});

const num = (name: string, label: string, def: number, min?: number, max?: number): FieldDef => ({
  name,
  label,
  type: "number",
  defaultValue: def,
  min,
  max,
});

const sel = (
  name: string,
  label: string,
  options: Array<{ value: string; label: string }>,
  def: string,
  extra: Partial<FieldDef> = {},
): FieldDef => ({ name, label, type: "select", options, defaultValue: def, ...extra });

const rep = (
  name: string,
  label: string,
  fields: FieldDef[],
  itemLabel: string,
  addLabel: string,
  def: unknown[] = [],
): FieldDef => ({
  name,
  label,
  type: "repeater",
  fields,
  itemLabel,
  addLabel,
  wide: true,
  defaultValue: def,
});

export const ICON_OPTIONS = [
  "Stethoscope",
  "HeartPulse",
  "Activity",
  "Syringe",
  "Pill",
  "Microscope",
  "Scan",
  "Droplets",
  "Wind",
  "Brain",
  "Bone",
  "Dna",
  "Thermometer",
  "FlaskConical",
  "Hospital",
  "Ambulance",
  "BedDouble",
  "ClipboardList",
  "CalendarCheck",
  "ShieldCheck",
  "Award",
  "Clock",
  "Users",
  "UserRound",
  "HandHeart",
  "Phone",
  "Mail",
  "MapPin",
  "Smile",
  "Scissors",
  "Sparkles",
  "Target",
  "Lightbulb",
  "Info",
  "Globe",
  "UserCheck",
  "Shield",
  "Link",
  "AlertTriangle",
  "RefreshCcw",
  "FileText",
  "GraduationCap",
  "Briefcase",
  "HelpCircle",
] as const;

export type IconName = (typeof ICON_OPTIONS)[number];

const icon = (name = "icon", label = "Icon", def: IconName = "Stethoscope"): FieldDef => ({
  name,
  label,
  type: "icon",
  defaultValue: def,
});

const BACKGROUND_OPTIONS = [
  { value: "white", label: "White" },
  { value: "slate", label: "Light grey" },
  { value: "dark", label: "Dark navy" },
  { value: "gradient", label: "Soft gradient" },
];

const background = (def = "white", options = BACKGROUND_OPTIONS): FieldDef =>
  sel("background", "Background", options, def);

const COLUMNS_2_3_4 = [
  { value: "2", label: "2 per row" },
  { value: "3", label: "3 per row" },
  { value: "4", label: "4 per row" },
];

const badge = (def = "") => txt("badge", "Badge text", def, { help: "Small pill above the heading" });
const heading = (def = "") => txt("heading", "Heading", def);
const subtitle = (def = "") => area("subtitle", "Sub heading", def);

/** Anchor id every section gets, so menu links can jump to it. */
const ANCHOR_FIELD: FieldDef = {
  name: "anchor",
  label: "Anchor id",
  type: "text",
  placeholder: "chambers",
  help: "Lets links jump straight to this section, e.g. /about-us#chambers",
};

function define(def: SectionDef): SectionDef {
  return { ...def, fields: [...def.fields, ANCHOR_FIELD] };
}

/* ----------------------------------------------------- shared content */

const PHONE_MAIN = "+8801858405083";
const PHONE_ALT = "+8801612371696";
const WHATSAPP = "8801858405083";
const WHATSAPP_MESSAGE = "আসসালামু আলাইকুম। আমি ডক্টর আরিফ ভেলিয়ার অ্যাপয়েন্টমেন্টের জন্য যোগাযোগ করছি।";

const CHAMBER_DEFAULTS = [
  {
    name: bn("কুমিল্লা ট্রমা সেন্টার"),
    logo: "/cumilla-logo.png",
    address: bn("রুম ৭০৬, ৭ম তলা (লিফট-৬), নতুন ভবন, রাণীর বাজার রোড, কান্দিরপাড়, কুমিল্লা"),
    days: bn("শনিবার থেকে বুধবার"),
    time: bn("দুপুর ২:০০ — বিকেল ৫:০০"),
    off_days: bn("বৃহস্পতি ও শুক্রবার বন্ধ"),
    map_url:
      "https://www.google.com/maps/place/Cumilla+Trauma+Centre/@23.4596351,91.1759144,17z/data=!3m1!4b1!4m6!3m5!1s0x37547f26759e8171:0x66e643556d5d8d8c!8m2!3d23.4596351!4d91.1784893!16s%2Fg%2F11r8y2fh0",
    theme: "red",
    show_alt_phone: true,
  },
  {
    name: bn("পপূলার ডায়াগনস্টিক সেন্টার"),
    logo: "/popular-logo.png",
    address: bn("রুম ৫১২, ৫ম তলা (লিফট-৪), হাউজ নাম্বার ৫৭, লাকসাম রোড, রামঘাট, কান্দিরপাড়, কুমিল্লা"),
    days: bn("শনিবার থেকে বুধবার"),
    time: bn("বিকেল ৫:০০ — রাত ৮:০০"),
    off_days: bn("বৃহস্পতি ও শুক্রবার বন্ধ"),
    map_url:
      "https://www.google.com/maps/place/Popular+Diagnostic+Centre,+Cumilla+Branch/@23.459514,91.1760966,17z/data=!4m6!3m5!1s0x37547f00462f8599:0x42aa888ebbe8dc!8m2!3d23.459514!4d91.1806027!16s%2Fg%2F11z4hvvkr6",
    theme: "green",
    show_alt_phone: true,
  },
  {
    name: bn("ডক্টর’স পয়েন্ট ডায়াগনস্টিক সেন্টার"),
    logo: "/doctorspoint-logo.png",
    address: bn("কালিকাপুর বাজার, বুড়িচং, কুমিল্লা"),
    days: bn("শুধুমাত্র শুক্রবার"),
    time: bn("সকাল ৮:০০ — রাত ৮:০০"),
    off_days: bn("শনিবার থেকে বৃহস্পতিবার"),
    map_url:
      "https://www.google.com/maps/place/Doctors+Point+Diagnostic+%26+Consultation+Center/@23.5493469,88.8710592,8z/data=!4m6!3m5!1s0x375479003a0ff267:0x9c96e045ab925b3b!8m2!3d23.5493469!4d91.1781881!16s%2Fg%2F11z059n1m1",
    theme: "blue",
    show_alt_phone: false,
  },
];

/* ============================================================ registry */

export const SECTION_DEFS: SectionDef[] = [
  /* ------------------------------------------------------------ HOME */
  define({
    type: "hero",
    label: "Doctor hero banner",
    description: "Name, credentials, photo and call buttons — the top of the home page.",
    icon: "PanelsTopLeft",
    group: "Home",
    fields: [
      badge("অর্থোপেডিক্স বিশেষজ্ঞ ও ট্রমা সার্জন"),
      txt("name_line1", "Name (line 1)", "ডা. গাজী মোহাম্মদ"),
      txt("name_line2", "Name (line 2, highlighted)", "আরিফুল ইসলাম (ভিলীয়া)"),
      txt("degrees", "Degrees", "এমবিবিএস, বিসিএস, এমএস (অর্থোপেডিক্স সার্জারী)"),
      txt("university", "University", "বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU), ঢাকা"),
      txt("position", "Position", "সহকারী রেজিস্ট্রার — ক্যাজুয়ালটি বিভাগ"),
      txt("hospital", "Hospital", "কুমিল্লা মেডিকেল কলেজ হাসপাতাল"),
      txt("primary_label", "Primary button text", "অ্যাপয়েন্টমেন্ট নিন"),
      plain("primary_phone", "Primary button phone", PHONE_MAIN),
      txt("secondary_label", "Secondary button text", "আরও জানুন"),
      link("secondary_href", "Secondary button link", "/about-us"),
      img("image", "Doctor photo", "/doctor-img.png"),
      bool("show_floating", "Show floating card", true),
      txt("floating_title", "Floating card title", "তিনটি চেম্বারে"),
      txt("floating_subtitle", "Floating card subtitle", "নিয়মিত রোগী দেখছেন"),
    ],
  }),

  define({
    type: "stats_video",
    label: "Statistics over video",
    description: "Experience, surgeries and patient numbers on a looping background video.",
    icon: "Activity",
    group: "Home",
    fields: [
      badge("সেবার পরিসংখ্যান"),
      txt("heading_line1", "Heading (line 1)", "সংখ্যার অন্তরালে"),
      txt("heading_line2", "Heading (line 2)", "একেকটি সুস্থতার গল্প"),
      plain("video", "Background video path", "/intro-video.mp4", {
        help: "An MP4 in /public or a full URL",
      }),
      area(
        "sentence",
        "Sentence",
        "বিগত {years} বছরের নিবেদিত পথচলায় সফলভাবে সম্পন্ন হয়েছে {surgeries} জটিল অর্থোপেডিক সার্জারি। সড়ক দুর্ঘটনাকবলিত ও জরুরি রোগীদের জন্য অত্যন্ত সুনামের সাথে করা হয়েছে {trauma} ট্রমা অপারেশন। যার ফলশ্রুতিতে এ পর্যন্ত আধুনিক ও সঠিক পরামর্শ পেয়েছেন {patients} এরও বেশি হাসিমুখ।",
        { help: "Use {years}, {surgeries}, {trauma} and {patients} where the numbers should appear." },
      ),
      txt("years", "Years of experience", "৫+"),
      txt("surgeries", "Surgeries", "৫০০০+"),
      txt("trauma", "Trauma operations", "১০০০+"),
      txt("patients", "Patients", "৫০,০০০+"),
    ],
  }),

  define({
    type: "treatments_preview",
    label: "Treatment cards",
    description: "Image cards linking to treatment pages.",
    icon: "Stethoscope",
    group: "Home",
    fields: [
      badge("বিশেষায়িত সেবা"),
      heading("আমাদের চিকিৎসা সেবাসমূহ"),
      txt("button_label", "Button text", "সকল চিকিৎসার বিবরণ দেখুন"),
      link("button_href", "Button link", "/our-treatments"),
      rep(
        "items",
        "Treatments",
        [
          txt("label", "Name"),
          area("desc", "Description"),
          img("image", "Image"),
          link("href", "Link"),
        ],
        "label",
        "Add treatment",
        [
          { label: bn("হাঁটু ব্যথা"), desc: bn("হাঁটুর লিগামেন্ট, কার্টিলেজ ও বিভিন্ন জটিলতার আধুনিক চিকিৎসা"), image: "/knee.jpg", href: "/our-treatments/knee-pain-treatment-cumilla" },
          { label: bn("কোমর ও মেরুদণ্ড"), desc: bn("ডিস্ক প্রোল্যাপ্স, সাইটিকা ও মেরুদণ্ডের তীব্র ব্যথা ব্যবস্থাপনা"), image: "/low-back-pain.jpg", href: "/our-treatments/back-pain-treatment-cumilla" },
          { label: bn("কাঁধ ও জয়েন্টের সমস্যা"), desc: bn("ফ্রোজেন শোল্ডার, কাঁধের জয়েন্ট ও পেশির দীর্ঘমেয়াদী সমস্যার সমাধান"), image: "/shoulder.webp", href: "/our-treatments/shoulder-joint-pain-treatment-cumilla" },
          { label: bn("স্পোর্টস ইনজুরি"), desc: bn("খেলোয়াড়দের পেশি ও লিগামেন্ট ইনজুরির বিশেষায়িত আধুনিক চিকিৎসা"), image: "/sports.jpg", href: "/our-treatments/sports-injury-treatment-cumilla" },
          { label: bn("মেরুদণ্ডের সমস্যা ও ট্রমা"), desc: bn("দুর্ঘটনাজনিত হাড় ভাঙা, স্থানচ্যুতি ও জটিল ট্রমা সার্জারি পরবর্তী সেবা"), image: "/spine.jpg", href: "/our-treatments/spine-trauma-treatment-cumilla" },
          { label: bn("হাতের কব্জি ও পায়ের পাতা"), desc: bn("কব্জি, পায়ের গোড়ালি ও রগ বা পেশির নানান রোগের সমাধান"), image: "/wrist.jpg", href: "/our-treatments/wrist-foot-pain-treatment-cumilla" },
        ],
      ),
    ],
  }),

  define({
    type: "chambers",
    label: "Chambers & schedule",
    description: "Chamber cards with logo, address, days, hours and a map button.",
    icon: "MapPin",
    group: "Home",
    fields: [
      badge("চেম্বার ও সময়সূচি"),
      heading("সরাসরি সাক্ষাৎ ও সিরিয়াল"),
      subtitle("রোগীদের সুবিধার্থে ৩টি ভিন্ন লোকেশনে এবং সুনির্দিষ্ট সময়ে চেম্বার পরিচালনা করা হচ্ছে।"),
      plain("main_phone", "Main phone", PHONE_ALT),
      plain("alt_phone", "Alternative phone", PHONE_MAIN),
      rep(
        "items",
        "Chambers",
        [
          txt("name", "Name"),
          img("logo", "Logo"),
          area("address", "Address"),
          txt("days", "Days"),
          txt("time", "Time"),
          txt("off_days", "Closed on"),
          link("map_url", "Google Maps link"),
          sel(
            "theme",
            "Colour",
            [
              { value: "red", label: "Red" },
              { value: "green", label: "Green" },
              { value: "blue", label: "Blue" },
            ],
            "blue",
          ),
          bool("show_alt_phone", "Show alternative phone", true),
        ],
        "name",
        "Add chamber",
        CHAMBER_DEFAULTS,
      ),
    ],
  }),

  define({
    type: "testimonials",
    label: "Testimonials slider",
    description: "Patient reviews in a swipeable carousel.",
    icon: "Quote",
    group: "Home",
    fields: [
      badge("রোগীর মতামত"),
      heading("রোগীরা কী বলছেন"),
      rep(
        "items",
        "Testimonials",
        [area("text", "Review"), txt("name", "Name"), txt("address", "Area")],
        "name",
        "Add testimonial",
        [
          { text: bn("অত্যন্ত অভিজ্ঞ এবং দক্ষ অর্থোপেডিক সার্জন। আমার হাঁটুর সমস্যা খুব দ্রুত সমাধান করেছেন। অত্যন্ত সেবাযত্ন সহকারে রোগীদের দেখেন।"), name: bn("মো: রফিকুল ইসলাম"), address: bn("কান্দিরপাড়, কুমিল্লা") },
          { text: bn("অনেক যত্ন সহকারে রোগীদের কথা শোনেন এবং বুঝিয়ে বলেন। চিকিৎসার মান অসাধারণ। সবার কাছে রেকমেন্ড করব।"), name: bn("ফাতেমা বেগম"), address: bn("শাসনগাছা, কুমিল্লা") },
          { text: bn("কোমর ব্যথার জন্য চিকিৎসা নিয়েছিলাম। খুব অল্প সময়েই ভাল ফল পেয়েছি। ডাক্তার স্যার অত্যন্ত আন্তরিক ও পেশাদার।"), name: bn("জহিরুল হক"), address: bn("বুড়িচং, কুমিল্লা") },
        ],
      ),
    ],
  }),

  define({
    type: "videos_latest",
    label: "Latest videos",
    description: "Shows the newest YouTube videos from Admin → Videos.",
    icon: "Play",
    group: "Home",
    fields: [
      badge("ভিডিও গ্যালারি"),
      heading("চিকিৎসা বিষয়ক ভিডিও"),
      txt("link_label", "Link text", "সকল ভিডিওসমূহ"),
      link("link_href", "Link", "/our-videos"),
      num("count", "How many videos", 4, 1, 12),
    ],
  }),

  define({
    type: "blogs_latest",
    label: "Latest blog posts",
    description: "Shows the newest published posts from Admin → Blog posts.",
    icon: "Newspaper",
    group: "Home",
    fields: [
      badge("স্বাস্থ্য টিপস"),
      heading("সর্বশেষ চিকিৎসা বিষয়ক পরামর্শ"),
      txt("link_label", "Link text", "সকল ব্লগসমূহ"),
      link("link_href", "Link", "/our-blogs"),
      num("count", "How many posts", 3, 1, 12),
    ],
  }),

  define({
    type: "cta_banner",
    label: "Call & WhatsApp banner",
    description: "Contact banner with a phone button and a WhatsApp button.",
    icon: "Phone",
    group: "Home",
    fields: [
      badge("সরাসরি যোগাযোগ"),
      heading("আপনার সুস্থতাই আমাদের একমাত্র লক্ষ্য"),
      area("body", "Text", "হাড়, জোড়া বা মেরুদণ্ডের যেকোনো সমস্যায় আর কষ্ট না পেয়ে আজই দেশের অভিজ্ঞ অর্থোপেডিক বিশেষজ্ঞের সিরিয়াল বুক করুন।"),
      plain("phone", "Phone number", PHONE_MAIN),
      plain("whatsapp_number", "WhatsApp number (digits only)", WHATSAPP),
      area("whatsapp_message", "WhatsApp pre-filled message", WHATSAPP_MESSAGE),
      txt("whatsapp_label", "WhatsApp button text", "হোয়াটসঅ্যাপে বুক করুন"),
    ],
  }),

  /* ---------------------------------------------------- PAGE CONTENT */
  define({
    type: "about_profile",
    label: "About the doctor",
    description: "Full profile: intro, stats, education, specialties, services, FAQ.",
    icon: "UserRound",
    group: "Page content",
    fields: [
      badge("আমার সম্পর্কে"),
      txt("name", "Name", "ডা: গাজী মোহাম্মদ আরিফুল ইসলাম"),
      txt("name_highlight", "Name suffix (highlighted)", "(ভিলীয়া)"),
      txt("degrees", "Degrees", "এমবিবিএস, বিসিএস, এমএস (অর্থোপেডিক্স সার্জারী)"),
      txt("university", "University", "বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়, ঢাকা।"),
      txt("position", "Position", "সহকারী রেজিষ্ট্রার – ক্যাজুয়ালটি বিভাগ, কুমিল্লা মেডিকেল কলেজ হাসপাতাল"),
      txt("specialty_tag", "Specialty pill", "অর্থোপেডিক্স, ট্রমা, স্পোর্টস ও হ্যান্ড সার্জন"),
      rep(
        "stats",
        "Stat cards",
        [icon("icon", "Icon", "Award"), txt("value", "Value"), txt("label", "Label")],
        "label",
        "Add stat",
        [
          { icon: "Award", value: bn("৫+ বছর"), label: bn("অভিজ্ঞতা") },
          { icon: "Stethoscope", value: bn("৫,০০০+"), label: bn("অর্থোপেডিক সার্জারি") },
          { icon: "HandHeart", value: bn("১,০০০+"), label: bn("ট্রমা সার্জারি") },
          { icon: "Users", value: bn("৫০,০০০+"), label: bn("পরামর্শ") },
        ],
      ),
      txt("bio_heading", "Biography heading", "একজন নিবেদিত প্রাণ অর্থোপেডিক্স বিশেষজ্ঞ"),
      area("bio", "Biography", "ডা. গাজী মোহাম্মদ আরিফুল ইসলাম (ভিলীয়া) একজন অর্থোপেডিক, ট্রমা, স্পোর্টস এন্ড হ্যান্ড সার্জন, এমবিবিএস, বিসিএস (স্বাস্থ্য) এবং এমএস (অর্থোপেডিক্স সার্জারি) সম্পন্ন করেছেন বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU) থেকে। বর্তমানে কুমিল্লা মেডিকেল কলেজ হাসপাতালের ক্যাজুয়ালটি বিভাগে সহকারী রেজিস্ট্রার হিসেবে কর্মরত, যেখানে প্রতিদিনের ট্রমা ও অর্থোপেডিক রোগী দেখার অভিজ্ঞতা থেকে তিনি ফ্র্যাকচার, হাঁটু-কোমর-ঘাড় ব্যথা, স্পোর্টস ইনজুরি ও হাতের সমস্যার চিকিৎসায় দক্ষতা অর্জন করেছেন। তিনি কুমিল্লা শহরের একাধিক চেম্বারে নিয়মিত রোগী দেখেন। রোগীর কথা মনোযোগ দিয়ে শোনা এবং সহজ ভাষায় চিকিৎসা বুঝিয়ে দেওয়া তার চিকিৎসা সেবার অন্যতম বৈশিষ্ট্য।"),
      txt("education_heading", "Education & profession heading", "শিক্ষা ও পেশাগত পরিচয়"),
      rep(
        "education",
        "Education",
        [txt("degree", "Degree"), txt("institution", "Institution")],
        "degree",
        "Add degree",
        [
          { degree: bn("এমএস (অর্থোপেডিক্স সার্জারি)"), institution: bn("বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (BSMMU)") },
          { degree: bn("এমবিবিএস"), institution: bn("শহীদ সোহরাওয়ার্দী মেডিকেল কলেজ") },
          { degree: bn("এইচএসসি"), institution: bn("কালিকাপুর আব্দুল মতিন খসরু ডিগ্রি কলেজ") },
          { degree: bn("এসএসসি"), institution: bn("শ্রীমন্তপুর এম. এ. সাত্তার উচ্চ বিদ্যালয়") },
        ],
      ),
      rep(
        "profession",
        "Professional identity",
        [txt("text", "Item")],
        "text",
        "Add item",
        [
          { text: bn("বিসিএস (স্বাস্থ্য) ক্যাডার কর্মকর্তা") },
          { text: bn("অর্থোপেডিক্স বিশেষজ্ঞ") },
          { text: bn("ট্রমা সার্জন") },
          { text: bn("স্পোর্টস ইনজুরি বিশেষজ্ঞ") },
          { text: bn("হ্যান্ড সার্জন") },
          { text: bn("সহকারী রেজিস্ট্রার, কুমিল্লা মেডিকেল কলেজ হাসপাতাল") },
        ],
      ),
      txt("specialties_heading", "Specialties heading", "যেসব সমস্যার চিকিৎসা করা হয়"),
      rep(
        "specialties",
        "Specialty groups",
        [txt("category", "Group name"), area("tags", "Problems (one per line)")],
        "category",
        "Add group",
        [
          { category: bn("হাড় ও জয়েন্টের সমস্যা"), tags: bn("হাঁটু ব্যথা\nকোমর ব্যথা\nঘাড় ব্যথা\nমেরুদণ্ডের ব্যথা\nকাঁধের ব্যথা\nফ্রোজেন শোল্ডার\nবাত ব্যথা\nজয়েন্টের ব্যথা\nঅস্টিওআর্থ্রাইটিস\nরিউমাটয়েড আর্থ্রাইটিস") },
          { category: bn("ফ্র্যাকচার ও দুর্ঘটনাজনিত আঘাত"), tags: bn("হাড় ভাঙা\nসড়ক দুর্ঘটনার আঘাত\nডিসলোকেশন\nজটিল ফ্র্যাকচার\nজরুরি ট্রমা চিকিৎসা") },
          { category: bn("হাতের বিভিন্ন সমস্যা"), tags: bn("কার্পাল টানেল সিনড্রোম\nট্রিগার ফিঙ্গার\nটেন্ডন ইনজুরি\nনার্ভ ইনজুরি\nহাতের সংক্রমণ") },
          { category: bn("খেলাধুলাজনিত আঘাত"), tags: bn("লিগামেন্ট ইনজুরি\nমেনিস্কাস ইনজুরি\nস্পোর্টস ইনজুরি\nজয়েন্ট ইনজুরি") },
        ],
      ),
      txt("services_heading", "Special services heading", "বিশেষ সেবা"),
      area("services_intro", "Special services intro", "বর্তমান সময়ে অনেক অর্থোপেডিক সমস্যার চিকিৎসায় আধুনিক প্রযুক্তি ব্যবহার করা হয়। রোগীর প্রয়োজন অনুযায়ী বিভিন্ন উন্নত চিকিৎসা পদ্ধতি প্রদান করা হয়:"),
      rep(
        "services",
        "Special services",
        [txt("name", "Name"), area("desc", "Description")],
        "name",
        "Add service",
        [
          { name: bn("PRP Therapy"), desc: bn("হাঁটুর ক্ষয়, টেন্ডন ও লিগামেন্ট ইনজুরিতে ব্যবহৃত") },
          { name: bn("Ultrasound Guided Injection"), desc: bn("নির্ভুল স্থানে ইনজেকশন প্রদানের পদ্ধতি") },
          { name: bn("Musculoskeletal Ultrasound (MSK USG)"), desc: bn("পেশি, টেন্ডন ও জয়েন্টের সমস্যা নির্ণয়ে") },
          { name: bn("C-arm Guided Spine Intervention"), desc: bn("মেরুদণ্ডের ব্যথা ও সায়াটিকার চিকিৎসায়") },
        ],
      ),
      txt("gratitude_title", "Gratitude box title", "কৃতজ্ঞতা"),
      area("gratitude_quote", "Gratitude quote", "শিক্ষাজীবনে প্রেরণার জন্য আমি গভীরভাবে কৃতজ্ঞতা প্রকাশ করছি আমার মরহুম দাদা, শ্রীমন্তপুর এম. এ. ছাত্তার উচ্চ বিদ্যালয়ের প্রতিষ্ঠাতা আলহাজ্ব আব্দুস সাত্তার খানের প্রতি।"),
      txt("faq_heading", "FAQ heading", "সচরাচর জিজ্ঞাসিত প্রশ্ন"),
      txt("faq_subtitle", "FAQ subtitle", "আপনার সাধারণ কিছু প্রশ্নের উত্তর"),
      rep(
        "faq",
        "Questions",
        [txt("q", "Question"), area("a", "Answer")],
        "q",
        "Add question",
        [
          { q: bn("সিরিয়াল কীভাবে নেব?"), a: bn("উপরের যেকোনো নম্বরে কল করে আপনার পছন্দের চেম্বার ও দিন অনুযায়ী সিরিয়াল নিতে পারবেন।") },
          { q: bn("প্রথম ভিজিটে কী নিয়ে যেতে হবে?"), a: bn("পূর্বের কোনো রিপোর্ট, এক্স-রে বা প্রেসক্রিপশন থাকলে সঙ্গে নিয়ে আসুন। না থাকলেও সমস্যা নেই।") },
          { q: bn("জরুরি ট্রমা বা দুর্ঘটনার রোগী দেখা হয় কি?"), a: bn("হ্যাঁ, দুর্ঘটনাজনিত আঘাত ও জরুরি ট্রমা রোগীর চিকিৎসা প্রদান করা হয়।") },
          { q: bn("অনলাইনে বা ফোনে পরামর্শ নেওয়া যায় কি?"), a: bn("হ্যাঁ, নির্দিষ্ট ক্ষেত্রে অনলাইনে বা ফোনে পরামর্শ নেওয়ার সুযোগ রয়েছে। বিস্তারিত তথ্য এবং অ্যাপয়েন্টমেন্টের জন্য প্রদত্ত নম্বরে যোগাযোগ করুন।") },
        ],
      ),
    ],
  }),

  define({
    type: "treatments_index",
    label: "Treatments overview",
    description: "Banner, the list of treatment pages, procedures and service lists.",
    icon: "ClipboardList",
    group: "Page content",
    fields: [
      img("banner", "Banner image", "/treatment-banner.jpg"),
      txt("specialties_heading", "Treatment list heading", "অর্থোপেডিক বিশেষত্বসমূহ"),
      area("specialties_subtitle", "Treatment list subtitle", "আপনার প্রয়োজন অনুযায়ী নির্দিষ্ট সমস্যার বিস্তারিত বিবরণ দেখে নিন।", {
        help: "The list itself comes from Admin → Treatments.",
      }),
      txt("procedures_heading", "Procedures heading", "চিকিৎসার আধুনিক প্রসিডিওর"),
      area("procedures_subtitle", "Procedures subtitle", "ব্যথামুক্ত ও আধুনিক ইন্টারভেনশনাল চিকিৎসা পদ্ধতিগুলোর বিস্তারিত বিবরণ।"),
      rep(
        "procedures",
        "Procedures",
        [icon("icon", "Icon", "Syringe"), txt("title", "Title"), area("text", "Description")],
        "title",
        "Add procedure",
        [
          { icon: "Syringe", title: bn("মেরুদন্ডের ইঞ্জেকশন (C-arm guided spine intervention)"), text: bn("Fluoroscopy বা C-arm হচ্ছে এক ধরনের low radiation x-ray machine। এই কম্পিউটারাইজড এক্সরে মেশিনের সাহায্যে রোগীর মেরুদন্ডের সুনির্দিষ্ট জায়গায় ইনজেকশন প্রদান করা হয়ে থাকে। মেরুদন্ডের ডিস্ক প্রোলাপ্স (PLID) ও স্পাইনাল স্টেনোসিস সহ অন্যান্য সমস্যায় সার্জারির বিকল্প হিসেবে এই প্রক্রিয়াটি অত্যন্ত কার্যকর।") },
          { icon: "Scan", title: bn("মাসকুলো-স্কেলেটাল আল্ট্রাসাউন্ড (MSK USG)"), text: bn("এক্সরের মাধ্যমে শুধুমাত্র হাড্ডি ও জয়েন্ট দেখা গেলেও, মাংসপেশী, টেন্ডন, লিগামেন্ট ও রক্তনালীর মতো সফট টিস্যু দেখার জন্য এমএসকে আলট্রাসাউন্ড সবচেয়ে কার্যকরী ব্যবস্থা। এটি সম্পূর্ণ ব্যথামুক্ত এবং চেম্বারেই দ্রুত সম্পন্ন করা যায়।") },
          { icon: "Microscope", title: bn("আল্ট্রাসাউন্ড দ্বারা ইনজেকশন (USGI)"), text: bn("আন্দাজ বা অনুমানের ওপর ভর করে শরীরের আক্রান্ত স্থানে ইনজেকশন দিলে তার সঠিকতা নিখুঁত হয় না। আধুনিক চিকিৎসা বিজ্ঞানে আলট্রাসাউন্ডের লাইভ ছবি দেখে সরাসরি সঠিক স্থানে ইনজেকশন প্রদান নিশ্চিত করা হয়।") },
          { icon: "Droplets", title: bn("পিআরপি থেরাপি (PRP therapy)"), text: bn("রোগীর নিজের রক্ত থেকে প্লাজমা সংগ্রহ করে ইনজেকশন হিসেবে ব্যবহার করার আধুনিক পদ্ধতি। হাঁটু, কাঁধ, কনুই বা অন্যান্য জয়েন্টের ব্যথা এবং অ্যাথলেটদের পেশি ও লিগামেন্ট পুনর্গঠনে এটি দারুণ ফল দেয়।") },
          { icon: "Wind", title: bn("ওজোন থেরাপি (Ozone therapy)"), text: bn("প্রাকৃতিক নিরাময় প্রক্রিয়া ত্বরান্বিত করতে এবং শরীরে অক্সিজেন সরবরাহ বাড়াতে ওজোন (O₃) গ্যাস প্রয়োগ করা হয়। আর্থ্রাইটিস, জয়েন্ট পেইন এবং প্রদাহ কমাতে এটি অত্যন্ত উপযোগী।") },
        ],
      ),
      txt("lists_heading", "Service lists heading", "ট্রমা সার্জারি ও অর্থোপেডিক চিকিৎসা"),
      txt("trauma_title", "Trauma list title", "ট্রমা সার্জারি চিকিৎসা"),
      rep("trauma_items", "Trauma surgeries", [txt("text", "Item")], "text", "Add item", [
        "Clavicle fracture fixation",
        "Humerus fracture & dislocation treatment",
        "Elbow fracture & dislocation Treatment",
        "Radius & Ulna Fracture fixation",
        "Wrist fracture & dislocation treatment",
        "Metacarpal & Phalanx fracture fixation",
        "Femoral Neck Fracture treatment",
        "Femoral Trochanteric fracture fixation",
        "Femoral Shaft fracture fixation",
        "Distal Femoral condyle fracture fixation",
        "Tibial plateau fracture fixation",
        "Tibial Shaft fracture fixation",
        "Ankle fracture fixation",
      ].map((text) => ({ text: bn(text) }))),
      txt("ortho_title", "Orthopaedic list title", "অর্থোপেডিক চিকিৎসা ও সেবা"),
      rep("ortho_items", "Orthopaedic treatments", [txt("text", "Item")], "text", "Add item", [
        "ঘাড়, কোমর, হাঁটু ও পায়ের গোড়ালি ব্যথা",
        "হাড় ক্ষয় (Osteoporosis) ও বাত ব্যথা",
        "ফ্রোজেন শোল্ডার (Adhesive Capsulitis)",
        "টেনিস এলবো ও গলফার এলবো",
        "ডি কুয়েরভেন'স টেনোসাইনোভাইটিস",
        "কার্পাল টানেল সিনড্রোম (CTS) ও ট্রিগার ফিঙ্গার",
        "রিউমাটয়েড আর্থ্রাইটিস ও অস্টিও-আর্থ্রাইটিস",
        "হ্যান্ড ইনফেকশন, টেন্ডন, লিগামেন্ট ও নার্ভ ইনজুরি",
        "জয়েন্ট আর্থ্রোপ্লাস্টি ও আধুনিক সার্জারি",
      ].map((text) => ({ text: bn(text) }))),
      txt("why_heading", "Why choose heading", "কেন ডা. গাজী মোহাম্মদ আরিফুল ইসলাম?"),
      rep("why_items", "Reasons", [txt("text", "Item")], "text", "Add reason", [
        "BSMMU প্রশিক্ষিত অর্থোপেডিক সার্জন (এমএস - অর্থোপেডিক্স সার্জারি)",
        "৩৫তম বিসিএস স্বাস্থ্য ক্যাডার চিকিৎসক",
        "কুমিল্লা মেডিকেল কলেজ হাসপাতালের সহকারী রেজিস্ট্রার, ক্যাজুয়ালটি বিভাগ",
        "৫+ বছরের চিকিৎসা অভিজ্ঞতা, ৫০০০+ অর্থোপেডিক সার্জারি ও ১০০০+ ট্রমা সার্জারি",
        "৫০,০০০+ রোগীকে সফলভাবে চিকিৎসা পরামর্শ প্রদান",
        "স্পোর্টস ইনজুরি, ট্রমা ও হ্যান্ড সার্জারিতে বিশেষ দক্ষতা",
      ].map((text) => ({ text: bn(text) }))),
    ],
  }),

  define({
    type: "videos_index",
    label: "Video gallery page",
    description: "Heading plus every video from Admin → Videos, with a YouTube panel.",
    icon: "Play",
    group: "Page content",
    fields: [
      badge("ভিডিওসমূহ"),
      heading("আমাদের ভিডিও গ্যালারি"),
      subtitle("চিকিৎসা সংক্রান্ত গুরুত্বপূর্ণ ভিডিও ও বিশেষজ্ঞের পরামর্শসমূহ"),
      txt("yt_heading", "YouTube panel heading", "আরও ভিডিও পেতে আমাদের ইউটিউব চ্যানেলটি দেখুন"),
      area("yt_text", "YouTube panel text", "স্বাস্থ্য বিষয়ক নিয়মিত আপডেট এবং নতুন নতুন ভিডিওর জন্য আমাদের চ্যানেলে সাবস্ক্রাইব করুন।"),
      txt("yt_label", "YouTube button text", "ইউটিউবে দেখুন"),
      link("yt_href", "YouTube channel link", "https://youtube.com/@dr.gaziarifvelia1?sub_confirmation=1"),
    ],
  }),

  define({
    type: "blogs_index",
    label: "Blog list page",
    description: "Heading plus every published post, with a YouTube panel below.",
    icon: "Newspaper",
    group: "Page content",
    fields: [
      badge("স্বাস্থ্য টিপস"),
      heading("স্বাস্থ্য সেবা বিষয়ক টিপস"),
      subtitle("চিকিৎসা সংক্রান্ত গুরুত্বপূর্ণ ভিডিও ও বিশেষজ্ঞের পরামর্শসমূহ"),
      txt("yt_heading", "YouTube panel heading", "আরও তথ্য পেতে আমাদের ইউটিউব চ্যানেলটি দেখুন"),
      area("yt_text", "YouTube panel text", "স্বাস্থ্য বিষয়ক নিয়মিত আপডেট এবং নতুন নতুন ভিডিওর জন্য আমাদের চ্যানেলে সাবস্ক্রাইব করুন।"),
      txt("yt_label", "YouTube button text", "ইউটিউবে দেখুন"),
      link("yt_href", "YouTube channel link", "https://youtube.com/@dr.gaziarifvelia1?sub_confirmation=1"),
    ],
  }),

  define({
    type: "legal_cards",
    label: "Legal / policy page",
    description: "Titled policy cards with an optional contact box (terms, privacy, disclaimer).",
    icon: "FileText",
    group: "Page content",
    fields: [
      badge("লিগ্যাল ইনফরমেশন"),
      heading("শর্তাবলী"),
      area("intro", "Intro paragraph"),
      rep(
        "items",
        "Policy cards",
        [icon("icon", "Icon", "Info"), txt("title", "Title"), area("content", "Text"), area("list", "Bullet list (one per line)")],
        "title",
        "Add card",
        [],
      ),
      bool("show_contact", "Show contact box", true),
      txt("contact_heading", "Contact box heading", "যোগাযোগ"),
      area("contact_intro", "Contact box text", "এই শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে যোগাযোগ করতে পারেন:", {
        help: "Doctor name, phones and chambers come from Site settings.",
      }),
    ],
  }),

  /* ---------------------------------------------------------- BLOCKS */
  define({
    type: "rich_text",
    label: "Rich text",
    description: "Free-form formatted text with an optional heading.",
    icon: "Type",
    group: "Blocks",
    fields: [
      badge(),
      heading("নতুন সেকশন"),
      rich("html", "Content", "<p>এখানে আপনার লেখা যুক্ত করুন।</p>"),
      background("white"),
      sel(
        "width",
        "Width",
        [
          { value: "narrow", label: "Narrow (reading width)" },
          { value: "full", label: "Full container" },
        ],
        "narrow",
      ),
    ],
  }),

  define({
    type: "image_text",
    label: "Image & text",
    description: "Picture on one side, formatted text and a button on the other.",
    icon: "FileText",
    group: "Blocks",
    fields: [
      badge(),
      heading("শিরোনাম লিখুন"),
      rich("html", "Content", "<p>এখানে আপনার লেখা যুক্ত করুন।</p>"),
      img("image", "Image", "/doctor-img.png"),
      sel(
        "image_position",
        "Image position",
        [
          { value: "right", label: "Right" },
          { value: "left", label: "Left" },
        ],
        "right",
      ),
      txt("button_label", "Button text"),
      link("button_href", "Button link"),
      background("white"),
    ],
  }),

  define({
    type: "card_grid",
    label: "Card grid",
    description: "Cards with image, title and text in 2, 3 or 4 columns.",
    icon: "Sparkles",
    group: "Blocks",
    fields: [
      badge(),
      heading("শিরোনাম লিখুন"),
      subtitle(),
      sel("columns", "Columns", COLUMNS_2_3_4, "3"),
      bool("show_images", "Show images", true),
      rep(
        "items",
        "Cards",
        [txt("title", "Title"), area("desc", "Description"), img("image", "Image"), link("href", "Link")],
        "title",
        "Add card",
        [
          { title: bn("কার্ড ১"), desc: bn("বিবরণ লিখুন"), image: "", href: "" },
          { title: bn("কার্ড ২"), desc: bn("বিবরণ লিখুন"), image: "", href: "" },
          { title: bn("কার্ড ৩"), desc: bn("বিবরণ লিখুন"), image: "", href: "" },
        ],
      ),
      background("slate"),
    ],
  }),

  define({
    type: "faq",
    label: "FAQ accordion",
    description: "Expandable questions and answers.",
    icon: "HelpCircle",
    group: "Blocks",
    fields: [
      badge("সাধারণ জিজ্ঞাসা"),
      heading("প্রায়শই জিজ্ঞাসিত প্রশ্ন"),
      rep("items", "Questions", [txt("q", "Question"), area("a", "Answer")], "q", "Add question", [
        { q: bn("প্রশ্ন লিখুন"), a: bn("উত্তর লিখুন") },
      ]),
      background("white"),
    ],
  }),

  define({
    type: "custom_cta",
    label: "Call to action",
    description: "Heading with two buttons on a gradient or dark background.",
    icon: "Target",
    group: "Blocks",
    fields: [
      badge(),
      heading("শিরোনাম লিখুন"),
      area("body", "Text"),
      txt("primary_label", "Primary button", "যোগাযোগ করুন"),
      link("primary_href", "Primary link", `tel:${PHONE_MAIN}`),
      txt("secondary_label", "Secondary button"),
      link("secondary_href", "Secondary link"),
      background("gradient", [
        { value: "gradient", label: "Soft gradient" },
        { value: "dark", label: "Dark navy" },
      ]),
    ],
  }),

  define({
    type: "gallery",
    label: "Photo gallery",
    description: "A grid of photos — from Admin → Gallery or hand-picked.",
    icon: "Images",
    group: "Blocks",
    fields: [
      badge("গ্যালারি"),
      heading("ছবির গ্যালারি"),
      sel(
        "source",
        "Image source",
        [
          { value: "gallery", label: "Gallery tab (automatic)" },
          { value: "manual", label: "Pick images below" },
        ],
        "gallery",
      ),
      num("count", "Maximum images", 12, 1, 60),
      rep("items", "Images", [img("image", "Image"), txt("alt", "Alt text")], "alt", "Add image", []),
      sel("columns", "Columns", COLUMNS_2_3_4, "4"),
      background("white"),
    ],
  }),

  define({
    type: "video_embed",
    label: "YouTube videos",
    description: "Embed specific YouTube videos.",
    icon: "Play",
    group: "Blocks",
    fields: [
      badge(),
      heading("ভিডিও"),
      rep("items", "Videos", [link("url", "YouTube link", "", { placeholder: "https://youtu.be/…" }), txt("title", "Title")], "title", "Add video", []),
      sel(
        "columns",
        "Columns",
        [
          { value: "1", label: "1 per row" },
          { value: "2", label: "2 per row" },
          { value: "3", label: "3 per row" },
        ],
        "2",
      ),
      background("slate"),
    ],
  }),

  define({
    type: "counters",
    label: "Number counters",
    description: "A few big numbers with labels.",
    icon: "Activity",
    group: "Blocks",
    fields: [
      badge(),
      heading(),
      rep("items", "Numbers", [txt("value", "Number"), txt("label", "Label")], "label", "Add number", [
        { value: bn("৫+"), label: bn("বছরের অভিজ্ঞতা") },
        { value: bn("৫০০০+"), label: bn("সফল সার্জারি") },
        { value: bn("৫০,০০০+"), label: bn("সন্তুষ্ট রোগী") },
      ]),
      background("slate", [
        { value: "white", label: "White" },
        { value: "slate", label: "Light grey" },
        { value: "dark", label: "Dark navy" },
      ]),
    ],
  }),

  define({
    type: "links",
    label: "Link buttons",
    description: "A row of button-style links.",
    icon: "Link",
    group: "Blocks",
    fields: [
      badge(),
      heading("গুরুত্বপূর্ণ লিংক"),
      rep("items", "Links", [txt("label", "Label"), link("href", "Link")], "label", "Add link", [
        { label: bn("লিংক ১"), href: "/" },
      ]),
      background("white"),
    ],
  }),

  define({
    type: "doctor_hero",
    label: "Doctor hero (landing)",
    description: "Breadcrumb, headline, stats strip and photo — for landing pages.",
    icon: "UserRound",
    group: "Blocks",
    fields: [
      txt("breadcrumb_label", "Breadcrumb link text", "হোম"),
      link("breadcrumb_href", "Breadcrumb link", "/"),
      txt("breadcrumb_current", "Current page name", "কুমিল্লার সেরা অর্থোপেডিক ডাক্তার"),
      txt("credentials", "Credentials line", "MBBS · BCS · MS (Orthopedic Surgery), BSMMU"),
      txt("heading", "Main heading", "Best Orthopedic Doctor in Cumilla"),
      bool("heading_en", "Heading in Latin font", true),
      txt("name", "Doctor name", "ডা. গাজী মোহাম্মদ আরিফুল ইসলাম (ভিলীয়া)"),
      area("position", "Position & hospital", "সহকারী রেজিস্ট্রার, ক্যাজুয়ালটি বিভাগ — কুমিল্লা মেডিকেল কলেজ হাসপাতাল"),
      rep("stats", "Statistics", [txt("value", "Number"), txt("label", "Label")], "label", "Add number", [
        { value: bn("5000+"), label: bn("সফল সার্জারি") },
        { value: bn("1000+"), label: bn("ট্রমা অপারেশন") },
        { value: bn("50,000+"), label: bn("সন্তুষ্ট রোগী") },
        { value: bn("5+"), label: bn("বছরের অভিজ্ঞতা") },
      ]),
      txt("primary_label", "Primary button", "অ্যাপয়েন্টমেন্ট নিন"),
      link("primary_href", "Primary link", `tel:${PHONE_MAIN}`),
      txt("secondary_label", "Secondary button", "হোয়াটসঅ্যাপে বুক করুন"),
      link("secondary_href", "Secondary link", `https://wa.me/${WHATSAPP}`),
      img("photo", "Doctor photo", "/doctor-img.png"),
      txt("photo_alt", "Photo alt text", "ডা. গাজী মোহাম্মদ আরিফুল ইসলাম"),
      background("white"),
    ],
  }),

  define({
    type: "emergency_strip",
    label: "Emergency strip",
    description: "A slim red bar with an emergency call button.",
    icon: "Ambulance",
    group: "Blocks",
    fields: [
      txt("message", "Message", "দুর্ঘটনাজনিত জরুরি ট্রমা রোগীর জন্য — সরাসরি কল করুন"),
      txt("button_label", "Button text", `জরুরি লাইন: ${PHONE_ALT}`),
      plain("phone", "Phone number", PHONE_ALT),
    ],
  }),

  define({
    type: "case_cards",
    label: "Patient stories",
    description: "Case-study cards with a tag, title and text.",
    icon: "ClipboardList",
    group: "Blocks",
    fields: [
      badge("রোগীর যাত্রা"),
      heading("রোগীর সুস্থতার গল্প"),
      subtitle("বাস্তব রোগীর অভিজ্ঞতা (রোগীর সম্মতিক্রমে, প্রয়োজনে নাম গোপন রাখা হয়েছে)।"),
      rep("items", "Cases", [txt("tag", "Tag"), txt("title", "Title"), area("body", "Text")], "title", "Add case", [
        { tag: bn("CASE 01 — KNEE TREATMENT"), title: bn("এক রোগীর গল্প: হাঁটুর তীব্র ব্যথা থেকে মুক্তি"), body: bn("সমস্যা কী ছিল, কী চিকিৎসা দেওয়া হয়েছিল এবং বর্তমান অবস্থা — এখানে লিখুন।") },
        { tag: bn("CASE 02 — TRAUMA RECOVERY"), title: bn("এক রোগীর গল্প: দুর্ঘটনা পরবর্তী সুস্থতা"), body: bn("সমস্যা কী ছিল, কী চিকিৎসা দেওয়া হয়েছিল এবং বর্তমান অবস্থা — এখানে লিখুন।") },
      ]),
      background("white"),
    ],
  }),

  define({
    type: "reviews_panel",
    label: "Reviews & Facebook panel",
    description: "Review cards with a Facebook page panel underneath.",
    icon: "Smile",
    group: "Blocks",
    fields: [
      badge("রোগীদের মতামত"),
      heading("রোগীদের অভিজ্ঞতার আলোকে তার চিকিৎসার মান"),
      subtitle("নিচের প্রতিটি মন্তব্য বাস্তব রোগীর — কোনো সাজানো রিভিউ নয়।"),
      sel(
        "columns",
        "Columns",
        [
          { value: "3", label: "3 per row" },
          { value: "2", label: "2 per row" },
        ],
        "3",
      ),
      rep("items", "Reviews", [area("quote", "Quote"), txt("author", "Name & area")], "author", "Add review", [
        { quote: bn("“অত্যন্ত অভিজ্ঞ এবং দক্ষ অর্থোপেডিক সার্জন। আমার হাঁটুর সমস্যা খুব দ্রুত সমাধান করেছেন।”"), author: bn("মো: রফিকুল ইসলাম — কান্দিরপাড়") },
        { quote: bn("“কোমর ব্যথার জন্য চিকিৎসা নিয়েছিলাম। খুব অল্প সময়েই ভাল ফল পেয়েছি।”"), author: bn("জহিরুল হক — বুড়িচং") },
        { quote: bn("“হাঁটু প্রতিস্থাপন অপারেশনের পর এখন আমি নিজে নিজেই হাঁটতে পারি।”"), author: bn("সুফিয়া খাতুন — চৌদ্দগ্রাম") },
      ]),
      txt("fb_heading", "Facebook panel heading", "Facebook পেইজে আমাদের ফলো করুন"),
      area("fb_text", "Facebook panel text", "রোগীদের মন্তব্য, আপডেট ও স্বাস্থ্য পরামর্শ পেতে পেইজটি ভিজিট করুন।"),
      rep("fb_stats", "Facebook stats", [txt("value", "Number"), txt("label", "Label")], "label", "Add stat", []),
      txt("fb_label", "Facebook button", "Facebook পেইজ দেখুন"),
      link("fb_href", "Facebook page link", "https://web.facebook.com/people/Dr-Gazi-Arif-Velia/61564919693953/"),
      background("slate"),
    ],
  }),

  define({
    type: "chambers_info",
    label: "Chambers with maps",
    description: "Chamber cards with an embedded map, address, hours and a call button.",
    icon: "Hospital",
    group: "Blocks",
    fields: [
      badge("চেম্বার"),
      heading("চেম্বার ও সিরিয়াল"),
      subtitle("সুবিধাজনক লোকেশন থেকে সিরিয়াল নিয়ে দেখা করুন।"),
      txt("address_label", "Address label", "ঠিকানা"),
      txt("hours_label", "Hours label", "সময়"),
      txt("phone_label", "Phone label", "ফোন"),
      rep(
        "items",
        "Chambers",
        [
          txt("name", "Name"),
          area("address", "Address"),
          txt("hours", "Hours"),
          plain("phone", "Phone"),
          link("map_url", "Google Maps embed URL", "", {
            help: "Google Maps → Share → Embed a map → copy the iframe src.",
          }),
          txt("button_label", "Button text", "কল করুন"),
        ],
        "name",
        "Add chamber",
        [
          { name: bn("কুমিল্লা ট্রমা সেন্টার"), address: bn("রুম ৭০৬, ৭ম তলা, রাণীর বাজার রোড, কান্দিরপাড়"), hours: bn("শনি–বুধ, দুপুর ২টা – বিকেল ৫টা"), phone: PHONE_ALT, map_url: "", button_label: bn("কল করুন") },
          { name: bn("পপুলার ডায়াগনস্টিক সেন্টার"), address: bn("রুম ৫১২, লাকসাম রোড, রামঘাট, কান্দিরপাড়"), hours: bn("শনি–বুধ, বিকেল ৫টা – রাত ৮টা"), phone: PHONE_MAIN, map_url: "", button_label: bn("কল করুন") },
          { name: bn("ডক্টর’স পয়েন্ট ডায়াগনস্টিক সেন্টার"), address: bn("কালিকাপুর বাজার, বুড়িচং, কুমিল্লা"), hours: bn("শুধু শুক্রবার, সকাল ৮টা – রাত ৮টা"), phone: PHONE_ALT, map_url: "", button_label: bn("কল করুন") },
        ],
      ),
      background("white"),
    ],
  }),

  define({
    type: "services_grid",
    label: "Services grid",
    description: "Hairline grid of services with a CTA strip underneath.",
    icon: "Sparkles",
    group: "Blocks",
    fields: [
      badge("চিকিৎসা সেবা"),
      heading("আমাদের চিকিৎসা সেবাসমূহ"),
      subtitle("হাঁটু থেকে মেরুদণ্ড — প্রতিটি হাড় ও জোড়ার সমস্যার আধুনিক ও নির্ভরযোগ্য চিকিৎসা।"),
      sel(
        "columns",
        "Columns",
        [
          { value: "3", label: "3 per row" },
          { value: "2", label: "2 per row" },
        ],
        "3",
      ),
      rep(
        "items",
        "Services",
        [txt("title", "Name"), area("desc", "Short description"), link("href", "Link"), txt("link_label", "Link text", "বিস্তারিত"), bool("highlight", "Dark card", false)],
        "title",
        "Add service",
        [
          { title: bn("হাঁটু ব্যথা"), desc: bn("হাঁটুর লিগামেন্ট, কার্টিলেজ ও বিভিন্ন জটিলতার আধুনিক চিকিৎসা।"), href: "/our-treatments/knee-pain-treatment-cumilla", link_label: bn("বিস্তারিত"), highlight: false },
          { title: bn("কোমর ও মেরুদণ্ড"), desc: bn("ডিস্ক প্রোল্যাপ্স, সাইটিকা ও মেরুদণ্ডের তীব্র ব্যথা ব্যবস্থাপনা।"), href: "/our-treatments/back-pain-treatment-cumilla", link_label: bn("বিস্তারিত"), highlight: false },
          { title: bn("কাঁধ ও জয়েন্টের সমস্যা"), desc: bn("ফ্রোজেন শোল্ডার, কাঁধের জয়েন্ট ও পেশির দীর্ঘমেয়াদী সমস্যার সমাধান।"), href: "/our-treatments/shoulder-joint-pain-treatment-cumilla", link_label: bn("বিস্তারিত"), highlight: false },
          { title: bn("স্পোর্টস ইনজুরি"), desc: bn("খেলোয়াড়দের পেশি ও লিগামেন্ট ইনজুরির বিশেষায়িত আধুনিক চিকিৎসা।"), href: "/our-treatments/sports-injury-treatment-cumilla", link_label: bn("বিস্তারিত"), highlight: false },
          { title: bn("মেরুদণ্ডের সমস্যা ও ট্রমা"), desc: bn("দুর্ঘটনাজনিত হাড় ভাঙা, স্থানচ্যুতি ও জটিল ট্রমা সার্জারি পরবর্তী সেবা।"), href: "/our-treatments/spine-trauma-treatment-cumilla", link_label: bn("বিস্তারিত"), highlight: false },
          { title: bn("হাতের কব্জি ও পায়ের পাতা"), desc: bn("কব্জি, পায়ের গোড়ালি ও রগ বা পেশির নানান রোগের সমাধান।"), href: "/our-treatments/wrist-foot-pain-treatment-cumilla", link_label: bn("বিস্তারিত"), highlight: false },
        ],
      ),
      txt("cta_heading", "CTA heading", "পুরো ক্লিনিক ও সব ডাক্তারের তথ্য একসাথে দেখতে চান?"),
      area("cta_text", "CTA text", "ডা. গাজী মোহাম্মদ আরিফুল ইসলাম (ভিলীয়া)-এর সম্পূর্ণ ওয়েবসাইটে সব বিভাগ, পরিচিতি ও যোগাযোগের তথ্য পাবেন।"),
      txt("cta_label", "CTA button", "হোম পেজে যান"),
      link("cta_href", "CTA link", "/"),
      background("white"),
    ],
  }),

  define({
    type: "custom_html",
    label: "Custom HTML + CSS",
    description: "Your own HTML and CSS; the CSS is scoped to this section only.",
    icon: "Code",
    group: "Blocks",
    fields: [
      {
        name: "html",
        label: "HTML",
        type: "code",
        wide: true,
        placeholder: '<div class="box">\n  <h3>শিরোনাম</h3>\n</div>',
        help: "Scripts, forms and event handlers are stripped. Iframes from YouTube and Google Maps are allowed.",
        defaultValue: "",
      },
      {
        name: "css",
        label: "CSS",
        type: "code",
        wide: true,
        placeholder: ".box {\n  padding: 24px;\n  border-radius: 12px;\n}",
        help: "Every selector is automatically limited to this section.",
        defaultValue: "",
      },
      sel(
        "container",
        "Width",
        [
          { value: "default", label: "Normal site width" },
          { value: "narrow", label: "Narrow" },
          { value: "full", label: "Full width" },
        ],
        "default",
      ),
      background("white"),
    ],
  }),

  /* ----------------------------------------------------------- FORMS */
  define({
    type: "appointment_form",
    label: "Appointment form",
    description: "Booking form; submissions land in Admin → Appointments.",
    icon: "CalendarCheck",
    group: "Forms",
    fields: [
      badge("অ্যাপয়েন্টমেন্ট"),
      heading("অনলাইনে সিরিয়াল নিন"),
      subtitle("ফর্মটি পূরণ করুন, আমরা ফোন করে সময় নিশ্চিত করব।"),
      rep("departments", "Chamber / department options", [txt("name", "Name")], "name", "Add option", [
        { name: bn("কুমিল্লা ট্রমা সেন্টার") },
        { name: bn("পপুলার ডায়াগনস্টিক সেন্টার") },
        { name: bn("ডক্টর’স পয়েন্ট ডায়াগনস্টিক সেন্টার") },
      ]),
      area("note", "Note under the form", "জরুরি প্রয়োজনে সরাসরি ফোন করুন।"),
      background("slate"),
    ],
  }),

  define({
    type: "contact_form",
    label: "Contact form",
    description: "Message form; submissions land in Admin → Messages.",
    icon: "Mail",
    group: "Forms",
    fields: [
      badge("যোগাযোগ"),
      heading("আমাদের সাথে যোগাযোগ করুন"),
      subtitle("প্রশ্ন বা পরামর্শ — যেকোনো প্রয়োজনে লিখুন।"),
      bool("show_details", "Show phone / address from Site settings", true),
      background("white"),
    ],
  }),
];

export const SECTION_MAP: Record<string, SectionDef> = Object.fromEntries(
  SECTION_DEFS.map((def) => [def.type, def]),
);

export const SECTION_GROUPS: SectionGroup[] = ["Home", "Page content", "Blocks", "Forms"];

export function getSectionDef(type: string): SectionDef | undefined {
  return SECTION_MAP[type];
}

function defaultForField(field: FieldDef): unknown {
  if (field.defaultValue !== undefined) {
    return structuredCloneSafe(field.defaultValue);
  }
  switch (field.type) {
    case "boolean":
      return false;
    case "number":
      return field.min ?? 0;
    case "repeater":
      return [];
    case "select":
      return field.options?.[0]?.value ?? "";
    default:
      return field.localized ? {} : "";
  }
}

/** Deep clone that works for the plain JSON we store in section data. */
function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** The starting `data` object for a newly inserted section. */
export function defaultSectionData(type: string): Record<string, unknown> {
  const def = getSectionDef(type);
  if (!def) return {};
  return Object.fromEntries(def.fields.map((f) => [f.name, defaultForField(f)]));
}

/** A blank row for a repeater field. */
export function emptyRepeaterItem(fields: FieldDef[]): Record<string, unknown> {
  return Object.fromEntries(
    fields.map((f) => [
      f.name,
      f.type === "number"
        ? (f.min ?? 0)
        : f.type === "boolean"
          ? (typeof f.defaultValue === "boolean" ? f.defaultValue : false)
          : f.type === "select" || f.type === "icon"
            ? (typeof f.defaultValue === "string" ? f.defaultValue : (f.options?.[0]?.value ?? ""))
            : f.localized
              ? {}
              : "",
    ]),
  );
}
