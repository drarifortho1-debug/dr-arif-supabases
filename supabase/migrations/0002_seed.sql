-- =====================================================================
--  Doctor Site CMS - demo content (optional)
--  Run AFTER 0001_init.sql. Safe to re-run: existing slugs are skipped.
--  Everything here can be edited or deleted from the admin panel.
-- =====================================================================

-- --------------------------------------------------------- site settings
insert into public.site_settings (
  id, site_name, tagline, default_locale, enabled_locales, seo, contact, socials, footer
) values (
  1,
  '{"bn": "সেবা মেডিকেল সেন্টার", "en": "Sheba Medical Centre"}',
  '{"bn": "আপনার পরিবারের বিশ্বস্ত স্বাস্থ্যসেবা", "en": "Trusted care for your whole family"}',
  'bn',
  array['bn', 'en'],
  '{
    "title": {"bn": "সেবা মেডিকেল সেন্টার — ঢাকা", "en": "Sheba Medical Centre — Dhaka"},
    "description": {
      "bn": "ঢাকার ধানমন্ডিতে অবস্থিত আধুনিক হাসপাতাল ও ডায়াগনস্টিক সেন্টার। কার্ডিওলজি, নিউরোলজি, শিশু ও অর্থোপেডিক বিভাগে বিশেষজ্ঞ চিকিৎসক।",
      "en": "A modern hospital and diagnostic centre in Dhanmondi, Dhaka with specialists in cardiology, neurology, paediatrics and orthopaedics."
    }
  }',
  '{
    "phone": "+880 1711-000000",
    "emergency_phone": "+880 1911-000000",
    "email": "info@shebamedical.example",
    "whatsapp": "+8801711000000",
    "address": {"bn": "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা ১২০৫", "en": "House 12, Road 5, Dhanmondi, Dhaka 1205"},
    "hours": {"bn": "শনি – বৃহস্পতি: সকাল ৯টা – রাত ৯টা\nশুক্রবার: বিকাল ৪টা – রাত ৯টা\nজরুরি বিভাগ: ২৪ ঘণ্টা", "en": "Sat – Thu: 9:00 am – 9:00 pm\nFriday: 4:00 pm – 9:00 pm\nEmergency: 24 hours"},
    "map": "Dhanmondi 5, Dhaka"
  }',
  '{"facebook": "https://facebook.com", "youtube": "https://youtube.com"}',
  '{
    "about": {
      "bn": "২০০৫ সাল থেকে আধুনিক চিকিৎসা ও আন্তরিক সেবায় আপনার পাশে।",
      "en": "Modern medicine with a personal touch, serving the community since 2005."
    }
  }'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------- pages
do $seed$
declare
  home_id     uuid;
  about_id    uuid;
  services_id uuid;
  doctors_id  uuid;
  contact_id  uuid;
begin
  -- ============================================================== HOME
  insert into public.pages (slug, title, status, is_home, seo_title, seo_description, sort_order)
  values (
    'home',
    '{"bn": "হোম", "en": "Home"}',
    'published', true,
    '{"bn": "সেবা মেডিকেল সেন্টার — আপনার বিশ্বস্ত স্বাস্থ্যসেবা", "en": "Sheba Medical Centre — Trusted healthcare in Dhaka"}',
    '{"bn": "বিশেষজ্ঞ চিকিৎসক, আধুনিক ডায়াগনস্টিক ও ২৪/৭ জরুরি সেবা।", "en": "Specialist doctors, modern diagnostics and 24/7 emergency care."}',
    0
  )
  on conflict (slug) do nothing
  returning id into home_id;

  if home_id is not null then
    insert into public.sections (page_id, type, data, sort_order) values
    (home_id, 'hero', $j${
      "eyebrow": {"bn": "আপনার সুস্থতাই আমাদের অঙ্গীকার", "en": "Your health, our commitment"},
      "heading": {"bn": "বিশেষজ্ঞ ডাক্তারের যত্নশীল চিকিৎসা", "en": "Expert care you can trust"},
      "subheading": {"bn": "আধুনিক প্রযুক্তি ও অভিজ্ঞ চিকিৎসকের সমন্বয়ে আপনার পরিবারের জন্য নির্ভরযোগ্য স্বাস্থ্যসেবা — সব এক ছাদের নিচে।", "en": "Modern facilities and experienced physicians delivering dependable care for your family, all under one roof."},
      "image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      "primary_label": {"bn": "অ্যাপয়েন্টমেন্ট নিন", "en": "Book an appointment"},
      "primary_url": "/contact",
      "secondary_label": {"bn": "আমাদের সেবা", "en": "Our services"},
      "secondary_url": "/services",
      "layout": "split",
      "highlights": [
        {"icon": "ShieldCheck", "text": {"bn": "২৪/৭ জরুরি সেবা", "en": "24/7 emergency care"}},
        {"icon": "Users", "text": {"bn": "৫০+ বিশেষজ্ঞ ডাক্তার", "en": "50+ specialist doctors"}},
        {"icon": "Microscope", "text": {"bn": "আধুনিক ডায়াগনস্টিক", "en": "Modern diagnostics"}}
      ],
      "background": "white", "spacing": "normal", "anchor": ""
    }$j$, 0),

    (home_id, 'features', $j${
      "eyebrow": {"bn": "কেন আমরা", "en": "Why us"},
      "heading": {"bn": "আমাদের বিশেষত্ব", "en": "What sets us apart"},
      "subheading": {"bn": "", "en": ""},
      "columns": "3",
      "items": [
        {"icon": "Award", "title": {"bn": "অভিজ্ঞ চিকিৎসক", "en": "Experienced doctors"}, "description": {"bn": "দেশ-বিদেশে প্রশিক্ষিত বিশেষজ্ঞ চিকিৎসকদের তত্ত্বাবধানে চিকিৎসা।", "en": "Care supervised by specialists trained at home and abroad."}},
        {"icon": "Microscope", "title": {"bn": "আধুনিক ল্যাব", "en": "Modern diagnostics"}, "description": {"bn": "নির্ভুল রিপোর্টের জন্য সর্বাধুনিক ডায়াগনস্টিক প্রযুক্তি।", "en": "State-of-the-art equipment for accurate, fast reports."}},
        {"icon": "Clock", "title": {"bn": "২৪/৭ সেবা", "en": "Always open"}, "description": {"bn": "দিন-রাত যেকোনো সময় জরুরি চিকিৎসা সহায়তা।", "en": "Emergency support available around the clock."}}
      ],
      "background": "muted", "spacing": "normal", "anchor": ""
    }$j$, 1),

    (home_id, 'services', $j${
      "eyebrow": {"bn": "আমাদের সেবা", "en": "Our services"},
      "heading": {"bn": "যেসব চিকিৎসা আমরা দিই", "en": "Treatments we provide"},
      "subheading": {"bn": "সাধারণ পরামর্শ থেকে বিশেষায়িত চিকিৎসা — সব এক ছাদের নিচে।", "en": "From routine consultation to specialised treatment, all under one roof."},
      "columns": "3",
      "items": [
        {"icon": "HeartPulse", "title": {"bn": "কার্ডিওলজি", "en": "Cardiology"}, "description": {"bn": "হৃদরোগ নির্ণয়, চিকিৎসা ও নিয়মিত ফলোআপ।", "en": "Diagnosis, treatment and follow-up for heart conditions."}, "url": "/services"},
        {"icon": "Brain", "title": {"bn": "নিউরোলজি", "en": "Neurology"}, "description": {"bn": "স্নায়ুতন্ত্রের রোগের আধুনিক চিকিৎসা।", "en": "Modern treatment for disorders of the nervous system."}, "url": "/services"},
        {"icon": "Baby", "title": {"bn": "শিশু বিভাগ", "en": "Paediatrics"}, "description": {"bn": "নবজাতক থেকে কিশোর — শিশুদের সার্বিক স্বাস্থ্যসেবা।", "en": "Complete care for newborns, children and adolescents."}, "url": "/services"},
        {"icon": "Bone", "title": {"bn": "অর্থোপেডিকস", "en": "Orthopaedics"}, "description": {"bn": "হাড়, জয়েন্ট ও মেরুদণ্ডের চিকিৎসা।", "en": "Treatment for bones, joints and the spine."}, "url": "/services"},
        {"icon": "FlaskConical", "title": {"bn": "ডায়াগনস্টিক", "en": "Diagnostics"}, "description": {"bn": "রক্ত পরীক্ষা, ইমেজিং ও প্যাথলজি।", "en": "Blood tests, imaging and pathology."}, "url": "/services"},
        {"icon": "Ambulance", "title": {"bn": "জরুরি বিভাগ", "en": "Emergency"}, "description": {"bn": "২৪ ঘণ্টা জরুরি চিকিৎসা ও অ্যাম্বুলেন্স।", "en": "Round-the-clock emergency care and ambulance."}, "url": "/services"}
      ],
      "background": "white", "spacing": "normal", "anchor": "services"
    }$j$, 2),

    (home_id, 'stats', $j${
      "eyebrow": {"bn": "", "en": ""}, "heading": {"bn": "", "en": ""}, "subheading": {"bn": "", "en": ""},
      "items": [
        {"value": {"bn": "২০+", "en": "20+"}, "label": {"bn": "বছরের অভিজ্ঞতা", "en": "Years of service"}, "icon": "Award"},
        {"value": {"bn": "৫০+", "en": "50+"}, "label": {"bn": "বিশেষজ্ঞ ডাক্তার", "en": "Specialist doctors"}, "icon": "UserRound"},
        {"value": {"bn": "১ লক্ষ+", "en": "100k+"}, "label": {"bn": "সেবা প্রাপ্ত রোগী", "en": "Patients treated"}, "icon": "HeartPulse"},
        {"value": {"bn": "২৪/৭", "en": "24/7"}, "label": {"bn": "জরুরি সেবা", "en": "Emergency care"}, "icon": "Ambulance"}
      ],
      "background": "tint", "spacing": "compact", "anchor": ""
    }$j$, 3),

    (home_id, 'doctors', $j${
      "eyebrow": {"bn": "আমাদের টিম", "en": "Our team"},
      "heading": {"bn": "বিশেষজ্ঞ চিকিৎসকবৃন্দ", "en": "Meet our specialists"},
      "subheading": {"bn": "", "en": ""},
      "columns": "3",
      "items": [
        {"photo": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80", "name": {"bn": "ডা. রফিকুল ইসলাম", "en": "Dr. Rafiqul Islam"}, "designation": {"bn": "কনসালট্যান্ট, কার্ডিওলজি", "en": "Consultant, Cardiology"}, "qualifications": {"bn": "এমবিবিএস, এফসিপিএস (কার্ডিওলজি)", "en": "MBBS, FCPS (Cardiology)"}, "bio": {"bn": "হৃদরোগ চিকিৎসায় ১৫ বছরের অভিজ্ঞতা।", "en": "Fifteen years of experience in cardiac care."}, "chamber_time": {"bn": "শনি – বৃহস্পতি, বিকাল ৫টা – রাত ৯টা", "en": "Sat – Thu, 5 pm – 9 pm"}, "url": ""},
        {"photo": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80", "name": {"bn": "ডা. ফারহানা হক", "en": "Dr. Farhana Haque"}, "designation": {"bn": "কনসালট্যান্ট, শিশু বিভাগ", "en": "Consultant, Paediatrics"}, "qualifications": {"bn": "এমবিবিএস, ডিসিএইচ, এমডি", "en": "MBBS, DCH, MD"}, "bio": {"bn": "নবজাতক ও শিশু স্বাস্থ্যে বিশেষজ্ঞ।", "en": "Specialist in newborn and child health."}, "chamber_time": {"bn": "রবি – বৃহস্পতি, সকাল ১০টা – দুপুর ২টা", "en": "Sun – Thu, 10 am – 2 pm"}, "url": ""},
        {"photo": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80", "name": {"bn": "ডা. তানভীর আহমেদ", "en": "Dr. Tanvir Ahmed"}, "designation": {"bn": "কনসালট্যান্ট, অর্থোপেডিকস", "en": "Consultant, Orthopaedics"}, "qualifications": {"bn": "এমবিবিএস, এমএস (অর্থো)", "en": "MBBS, MS (Ortho)"}, "bio": {"bn": "জয়েন্ট রিপ্লেসমেন্ট ও স্পোর্টস ইনজুরিতে অভিজ্ঞ।", "en": "Experienced in joint replacement and sports injuries."}, "chamber_time": {"bn": "শনি – বুধ, সন্ধ্যা ৬টা – রাত ১০টা", "en": "Sat – Wed, 6 pm – 10 pm"}, "url": ""}
      ],
      "background": "muted", "spacing": "normal", "anchor": "doctors"
    }$j$, 4),

    (home_id, 'testimonials', $j${
      "eyebrow": {"bn": "রোগীদের মতামত", "en": "Testimonials"},
      "heading": {"bn": "যা বলছেন আমাদের রোগীরা", "en": "What our patients say"},
      "subheading": {"bn": "", "en": ""},
      "items": [
        {"quote": {"bn": "ডাক্তার সাহেব খুব মনোযোগ দিয়ে কথা শুনেছেন এবং চিকিৎসা খুব ভালো হয়েছে।", "en": "The doctor listened carefully and the treatment worked wonderfully."}, "name": {"bn": "সাবিনা আক্তার", "en": "Sabina Akhter"}, "role": {"bn": "ধানমন্ডি, ঢাকা", "en": "Dhanmondi, Dhaka"}, "photo": "", "rating": 5},
        {"quote": {"bn": "রিপোর্ট দ্রুত পেয়েছি, স্টাফরা খুব সহযোগিতাপূর্ণ।", "en": "Reports came back quickly and the staff were very helpful."}, "name": {"bn": "মাহবুব রহমান", "en": "Mahbub Rahman"}, "role": {"bn": "মোহাম্মদপুর, ঢাকা", "en": "Mohammadpur, Dhaka"}, "photo": "", "rating": 5},
        {"quote": {"bn": "আমার মেয়ের চিকিৎসায় ডা. ফারহানার যত্ন ভোলার নয়।", "en": "Dr. Farhana's care for my daughter was exceptional."}, "name": {"bn": "নুসরাত জাহান", "en": "Nusrat Jahan"}, "role": {"bn": "উত্তরা, ঢাকা", "en": "Uttara, Dhaka"}, "photo": "", "rating": 4}
      ],
      "background": "white", "spacing": "normal", "anchor": ""
    }$j$, 5),

    (home_id, 'blog_list', $j${
      "eyebrow": {"bn": "ব্লগ", "en": "Blog"},
      "heading": {"bn": "স্বাস্থ্য বিষয়ক পরামর্শ", "en": "Health tips and news"},
      "subheading": {"bn": "", "en": ""},
      "limit": 3, "show_view_all": true,
      "background": "muted", "spacing": "normal", "anchor": ""
    }$j$, 6),

    (home_id, 'cta', $j${
      "heading": {"bn": "আজই অ্যাপয়েন্টমেন্ট নিন", "en": "Book your appointment today"},
      "subheading": {"bn": "আমাদের বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিতে এখনই যোগাযোগ করুন।", "en": "Talk to one of our specialists — we are here to help."},
      "button_label": {"bn": "যোগাযোগ করুন", "en": "Contact us"},
      "button_url": "/contact",
      "phone": "+880 1711-000000",
      "image": "",
      "background": "white", "spacing": "normal", "anchor": ""
    }$j$, 7);
  end if;

  -- ============================================================= ABOUT
  insert into public.pages (slug, title, status, seo_description, sort_order)
  values (
    'about',
    '{"bn": "আমাদের সম্পর্কে", "en": "About us"}',
    'published',
    '{"bn": "সেবা মেডিকেল সেন্টারের ইতিহাস, লক্ষ্য ও চিকিৎসক দল।", "en": "The story, mission and team behind Sheba Medical Centre."}',
    1
  )
  on conflict (slug) do nothing
  returning id into about_id;

  if about_id is not null then
    insert into public.sections (page_id, type, data, sort_order) values
    (about_id, 'about', $j${
      "eyebrow": {"bn": "আমাদের সম্পর্কে", "en": "About us"},
      "heading": {"bn": "রোগীর আস্থাই আমাদের শক্তি", "en": "Built on the trust of our patients"},
      "body": {"bn": "<p>২০০৫ সাল থেকে আমরা ঢাকার মানুষের স্বাস্থ্যসেবায় নিয়োজিত। অভিজ্ঞ চিকিৎসক, আধুনিক যন্ত্রপাতি এবং আন্তরিক সেবার মাধ্যমে আমরা প্রতিদিন শত শত রোগীর পাশে দাঁড়াই।</p><p>আমাদের লক্ষ্য — সাশ্রয়ী খরচে আন্তর্জাতিক মানের চিকিৎসা প্রতিটি পরিবারের নাগালে পৌঁছে দেওয়া।</p>", "en": "<p>Since 2005 we have served Dhaka with experienced physicians, modern equipment and genuine care — supporting hundreds of patients every day.</p><p>Our mission is simple: world-class treatment at a price every family can afford.</p>"},
      "image": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
      "image_position": "right",
      "points": [
        {"text": {"bn": "রোগীকেন্দ্রিক চিকিৎসা পরিকল্পনা", "en": "Patient-first treatment plans"}},
        {"text": {"bn": "স্বচ্ছ ও সাশ্রয়ী খরচ", "en": "Transparent, affordable pricing"}},
        {"text": {"bn": "আন্তর্জাতিক মানের ল্যাব", "en": "Internationally accredited laboratory"}}
      ],
      "button_label": {"bn": "আমাদের ডাক্তার", "en": "Meet the doctors"},
      "button_url": "/doctors",
      "background": "white", "spacing": "normal", "anchor": ""
    }$j$, 0),

    (about_id, 'gallery', $j${
      "eyebrow": {"bn": "গ্যালারি", "en": "Gallery"},
      "heading": {"bn": "আমাদের প্রতিষ্ঠান", "en": "Inside our facility"},
      "subheading": {"bn": "", "en": ""},
      "columns": "3",
      "items": [
        {"image": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80", "caption": {"bn": "অভ্যর্থনা", "en": "Reception"}},
        {"image": "https://images.unsplash.com/photo-1586773860383-dfc93a4a7a9a?auto=format&fit=crop&w=900&q=80", "caption": {"bn": "অপারেশন থিয়েটার", "en": "Operating theatre"}},
        {"image": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80", "caption": {"bn": "ডায়াগনস্টিক ল্যাব", "en": "Diagnostic laboratory"}}
      ],
      "background": "muted", "spacing": "normal", "anchor": ""
    }$j$, 1),

    (about_id, 'faq', $j${
      "eyebrow": {"bn": "জিজ্ঞাসা", "en": "FAQ"},
      "heading": {"bn": "সাধারণ প্রশ্ন ও উত্তর", "en": "Frequently asked questions"},
      "subheading": {"bn": "", "en": ""},
      "items": [
        {"question": {"bn": "অ্যাপয়েন্টমেন্ট কীভাবে নেব?", "en": "How do I book an appointment?"}, "answer": {"bn": "ওয়েবসাইটের ফর্ম পূরণ করে অথবা সরাসরি ফোন করে অ্যাপয়েন্টমেন্ট নেওয়া যাবে।", "en": "Fill in the form on this website or simply call our reception."}},
        {"question": {"bn": "রিপোর্ট কতদিনে পাওয়া যায়?", "en": "How long do test reports take?"}, "answer": {"bn": "বেশিরভাগ রিপোর্ট ২৪ ঘণ্টার মধ্যে অনলাইনে পাওয়া যায়।", "en": "Most reports are available online within 24 hours."}},
        {"question": {"bn": "স্বাস্থ্য বীমা গ্রহণ করা হয় কি?", "en": "Do you accept health insurance?"}, "answer": {"bn": "হ্যাঁ, দেশের প্রধান বীমা প্রতিষ্ঠানগুলোর সাথে আমাদের চুক্তি রয়েছে।", "en": "Yes, we work with all major insurers in Bangladesh."}}
      ],
      "background": "white", "spacing": "normal", "anchor": ""
    }$j$, 2);
  end if;

  -- ========================================================== SERVICES
  insert into public.pages (slug, title, status, sort_order)
  values ('services', '{"bn": "সেবাসমূহ", "en": "Services"}', 'published', 2)
  on conflict (slug) do nothing
  returning id into services_id;

  if services_id is not null then
    insert into public.sections (page_id, type, data, sort_order) values
    (services_id, 'services', $j${
      "eyebrow": {"bn": "আমাদের সেবা", "en": "Our services"},
      "heading": {"bn": "বিভাগসমূহ", "en": "Departments"},
      "subheading": {"bn": "প্রতিটি বিভাগে অভিজ্ঞ কনসালট্যান্ট ও আধুনিক সুবিধা।", "en": "Every department is led by an experienced consultant."},
      "columns": "3",
      "items": [
        {"icon": "HeartPulse", "title": {"bn": "কার্ডিওলজি", "en": "Cardiology"}, "description": {"bn": "ইসিজি, ইকো, অ্যাঞ্জিওগ্রাম ও হৃদরোগ ব্যবস্থাপনা।", "en": "ECG, echo, angiogram and long-term heart care."}, "url": ""},
        {"icon": "Brain", "title": {"bn": "নিউরোলজি", "en": "Neurology"}, "description": {"bn": "স্ট্রোক, মাইগ্রেন ও স্নায়ুরোগের চিকিৎসা।", "en": "Stroke, migraine and nerve disorders."}, "url": ""},
        {"icon": "Baby", "title": {"bn": "শিশু বিভাগ", "en": "Paediatrics"}, "description": {"bn": "টিকা, বৃদ্ধি পর্যবেক্ষণ ও শিশুরোগ।", "en": "Vaccination, growth monitoring and childhood illness."}, "url": ""},
        {"icon": "Bone", "title": {"bn": "অর্থোপেডিকস", "en": "Orthopaedics"}, "description": {"bn": "ফ্র্যাকচার, জয়েন্ট রিপ্লেসমেন্ট ও ফিজিওথেরাপি।", "en": "Fractures, joint replacement and physiotherapy."}, "url": ""},
        {"icon": "Eye", "title": {"bn": "চক্ষু বিভাগ", "en": "Ophthalmology"}, "description": {"bn": "চোখের পরীক্ষা, ছানি ও লেজার চিকিৎসা।", "en": "Eye exams, cataract and laser treatment."}, "url": ""},
        {"icon": "FlaskConical", "title": {"bn": "ডায়াগনস্টিক", "en": "Diagnostics"}, "description": {"bn": "প্যাথলজি, এক্স-রে, আল্ট্রাসাউন্ড ও সিটি স্ক্যান।", "en": "Pathology, X-ray, ultrasound and CT scan."}, "url": ""}
      ],
      "background": "white", "spacing": "normal", "anchor": ""
    }$j$, 0),

    (services_id, 'cta', $j${
      "heading": {"bn": "কোন বিভাগে যাবেন বুঝতে পারছেন না?", "en": "Not sure which department you need?"},
      "subheading": {"bn": "আমাদের হেল্পলাইনে ফোন করুন, আমরা সঠিক ডাক্তারের কাছে পৌঁছে দেব।", "en": "Call our helpline and we will guide you to the right doctor."},
      "button_label": {"bn": "অ্যাপয়েন্টমেন্ট নিন", "en": "Book an appointment"},
      "button_url": "/contact",
      "phone": "+880 1711-000000",
      "image": "",
      "background": "white", "spacing": "normal", "anchor": ""
    }$j$, 1);
  end if;

  -- =========================================================== DOCTORS
  insert into public.pages (slug, title, status, sort_order)
  values ('doctors', '{"bn": "চিকিৎসকবৃন্দ", "en": "Doctors"}', 'published', 3)
  on conflict (slug) do nothing
  returning id into doctors_id;

  if doctors_id is not null then
    insert into public.sections (page_id, type, data, sort_order)
    select doctors_id, s.type, s.data, 0
    from public.sections s
    join public.pages p on p.id = s.page_id
    where p.slug = 'home' and s.type = 'doctors'
    limit 1;

    insert into public.sections (page_id, type, data, sort_order) values
    (doctors_id, 'appointment', $j${
      "eyebrow": {"bn": "অ্যাপয়েন্টমেন্ট", "en": "Appointment"},
      "heading": {"bn": "অনলাইনে সময় নিন", "en": "Request a visit"},
      "subheading": {"bn": "ফর্মটি পূরণ করুন, আমরা ফোন করে সময় নিশ্চিত করব।", "en": "Fill in the form and we will call you to confirm the time."},
      "image": "",
      "departments": [
        {"name": {"bn": "কার্ডিওলজি", "en": "Cardiology"}},
        {"name": {"bn": "নিউরোলজি", "en": "Neurology"}},
        {"name": {"bn": "শিশু বিভাগ", "en": "Paediatrics"}},
        {"name": {"bn": "অর্থোপেডিকস", "en": "Orthopaedics"}},
        {"name": {"bn": "চক্ষু বিভাগ", "en": "Ophthalmology"}}
      ],
      "note": {"bn": "জরুরি প্রয়োজনে সরাসরি ফোন করুন।", "en": "For emergencies please call us directly."},
      "background": "muted", "spacing": "normal", "anchor": "appointment"
    }$j$, 1);
  end if;

  -- =========================================================== CONTACT
  insert into public.pages (slug, title, status, sort_order)
  values ('contact', '{"bn": "যোগাযোগ", "en": "Contact"}', 'published', 4)
  on conflict (slug) do nothing
  returning id into contact_id;

  if contact_id is not null then
    insert into public.sections (page_id, type, data, sort_order) values
    (contact_id, 'contact', $j${
      "eyebrow": {"bn": "যোগাযোগ", "en": "Contact"},
      "heading": {"bn": "আমাদের সাথে যোগাযোগ করুন", "en": "Get in touch"},
      "subheading": {"bn": "প্রশ্ন, পরামর্শ বা অ্যাপয়েন্টমেন্ট — যেকোনো প্রয়োজনে লিখুন।", "en": "Questions, feedback or appointments — we would love to hear from you."},
      "show_form": true, "show_details": true, "map": "",
      "background": "white", "spacing": "normal", "anchor": ""
    }$j$, 0),

    (contact_id, 'appointment', $j${
      "eyebrow": {"bn": "অ্যাপয়েন্টমেন্ট", "en": "Appointment"},
      "heading": {"bn": "অনলাইনে সময় নিন", "en": "Request a visit"},
      "subheading": {"bn": "", "en": ""},
      "image": "",
      "departments": [
        {"name": {"bn": "কার্ডিওলজি", "en": "Cardiology"}},
        {"name": {"bn": "নিউরোলজি", "en": "Neurology"}},
        {"name": {"bn": "শিশু বিভাগ", "en": "Paediatrics"}},
        {"name": {"bn": "অর্থোপেডিকস", "en": "Orthopaedics"}}
      ],
      "note": {"bn": "জরুরি প্রয়োজনে সরাসরি ফোন করুন।", "en": "For emergencies please call us directly."},
      "background": "muted", "spacing": "normal", "anchor": "appointment"
    }$j$, 1);
  end if;
end $seed$;

-- ---------------------------------------------------------------- menus
do $menus$
declare
  header_id uuid;
  footer_id uuid;
  services_item uuid;
begin
  insert into public.menus (location) values ('header')
  on conflict (location) do nothing
  returning id into header_id;

  if header_id is not null then
    insert into public.menu_items (menu_id, label, url, sort_order) values
      (header_id, '{"bn": "হোম", "en": "Home"}', '/', 0),
      (header_id, '{"bn": "আমাদের সম্পর্কে", "en": "About"}', '/about', 1);

    insert into public.menu_items (menu_id, label, url, sort_order)
    values (header_id, '{"bn": "সেবাসমূহ", "en": "Services"}', '/services', 2)
    returning id into services_item;

    insert into public.menu_items (menu_id, parent_id, label, url, sort_order) values
      (header_id, services_item, '{"bn": "কার্ডিওলজি", "en": "Cardiology"}', '/services#services', 0),
      (header_id, services_item, '{"bn": "শিশু বিভাগ", "en": "Paediatrics"}', '/services#services', 1),
      (header_id, services_item, '{"bn": "ডায়াগনস্টিক", "en": "Diagnostics"}', '/services#services', 2);

    insert into public.menu_items (menu_id, label, url, sort_order) values
      (header_id, '{"bn": "চিকিৎসকবৃন্দ", "en": "Doctors"}', '/doctors', 3),
      (header_id, '{"bn": "ব্লগ", "en": "Blog"}', '/blog', 4),
      (header_id, '{"bn": "যোগাযোগ", "en": "Contact"}', '/contact', 5);
  end if;

  insert into public.menus (location) values ('footer')
  on conflict (location) do nothing
  returning id into footer_id;

  if footer_id is not null then
    insert into public.menu_items (menu_id, label, url, sort_order) values
      (footer_id, '{"bn": "আমাদের সম্পর্কে", "en": "About us"}', '/about', 0),
      (footer_id, '{"bn": "সেবাসমূহ", "en": "Services"}', '/services', 1),
      (footer_id, '{"bn": "চিকিৎসকবৃন্দ", "en": "Doctors"}', '/doctors', 2),
      (footer_id, '{"bn": "অ্যাপয়েন্টমেন্ট", "en": "Appointment"}', '/contact#appointment', 3),
      (footer_id, '{"bn": "ব্লগ", "en": "Blog"}', '/blog', 4);
  end if;
end $menus$;

-- ------------------------------------------------------ blog categories
insert into public.post_categories (slug, name, sort_order) values
  ('health-tips', '{"bn": "স্বাস্থ্য টিপস", "en": "Health tips"}', 0),
  ('news',        '{"bn": "সংবাদ", "en": "News"}', 1)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- posts
insert into public.posts (slug, title, excerpt, content, cover_image, category_id, status, published_at)
select
  v.slug, v.title::jsonb, v.excerpt::jsonb, v.content::jsonb, v.cover_image,
  (select id from public.post_categories where slug = v.category),
  'published', now() - (v.days_ago || ' days')::interval
from (values
  (
    'heart-healthy-habits',
    '{"bn": "সুস্থ হৃদয়ের জন্য ৭টি দৈনন্দিন অভ্যাস", "en": "7 daily habits for a healthy heart"}',
    '{"bn": "ছোট ছোট পরিবর্তনই হৃদরোগের ঝুঁকি অনেকটা কমিয়ে দিতে পারে।", "en": "Small changes add up to a much lower risk of heart disease."}',
    '{"bn": "<h2>প্রতিদিন হাঁটুন</h2><p>দিনে অন্তত ৩০ মিনিট দ্রুত হাঁটা রক্তচাপ ও কোলেস্টেরল নিয়ন্ত্রণে রাখে।</p><h2>লবণ কমান</h2><p>প্রক্রিয়াজাত খাবারে লুকানো লবণ থাকে — ঘরে রান্না করা খাবার বেছে নিন।</p><h2>ধূমপান ছাড়ুন</h2><p>ধূমপান ছাড়ার এক বছরের মধ্যেই হৃদরোগের ঝুঁকি অর্ধেক হয়ে যায়।</p><p>নিয়মিত চেকআপের জন্য আমাদের কার্ডিওলজি বিভাগে যোগাযোগ করুন।</p>", "en": "<h2>Walk every day</h2><p>Thirty minutes of brisk walking keeps blood pressure and cholesterol in check.</p><h2>Cut down on salt</h2><p>Processed food hides a lot of sodium — choose home-cooked meals where you can.</p><h2>Stop smoking</h2><p>Within a year of quitting, your risk of heart disease halves.</p><p>Book a routine check-up with our cardiology department to stay ahead.</p>"}',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    'health-tips', '3'
  ),
  (
    'dengue-season-precautions',
    '{"bn": "ডেঙ্গু মৌসুমে যা করবেন, যা করবেন না", "en": "Dengue season: what to do and what to avoid"}',
    '{"bn": "জ্বর হলে নিজে নিজে ওষুধ নয় — কখন হাসপাতালে আসবেন জেনে নিন।", "en": "Never self-medicate a fever — learn when to come to the hospital."}',
    '{"bn": "<p>বর্ষা মৌসুমে ডেঙ্গুর প্রকোপ বাড়ে। ঘরের আশপাশে জমে থাকা পানি ফেলে দিন এবং দিনে মশারি ব্যবহার করুন।</p><h2>সতর্ক সংকেত</h2><ul><li>তীব্র পেটব্যথা</li><li>বারবার বমি</li><li>দাঁতের মাড়ি বা নাক দিয়ে রক্ত পড়া</li></ul><p>এই লক্ষণগুলো দেখা দিলে দেরি না করে জরুরি বিভাগে আসুন।</p>", "en": "<p>Dengue peaks during the monsoon. Empty any standing water around your home and use a mosquito net during the day.</p><h2>Warning signs</h2><ul><li>Severe abdominal pain</li><li>Repeated vomiting</li><li>Bleeding gums or nose</li></ul><p>If you notice any of these, come to our emergency department without delay.</p>"}',
    'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
    'health-tips', '10'
  ),
  (
    'new-ct-scan-machine',
    '{"bn": "নতুন ১২৮-স্লাইস সিটি স্ক্যান মেশিন চালু", "en": "New 128-slice CT scanner now in service"}',
    '{"bn": "আরও দ্রুত ও নিখুঁত ইমেজিং এখন সেবা মেডিকেল সেন্টারে।", "en": "Faster, sharper imaging is now available at Sheba Medical Centre."}',
    '{"bn": "<p>আমাদের ডায়াগনস্টিক বিভাগে যুক্ত হয়েছে সর্বাধুনিক ১২৮-স্লাইস সিটি স্ক্যানার। কম রেডিয়েশনে মাত্র কয়েক সেকেন্ডে পুরো শরীরের স্ক্যান সম্ভব।</p><p>অ্যাপয়েন্টমেন্টের জন্য আমাদের হেল্পলাইনে ফোন করুন।</p>", "en": "<p>Our diagnostics department has installed a state-of-the-art 128-slice CT scanner. Whole-body scans now take seconds, with a lower radiation dose.</p><p>Call our helpline to book a slot.</p>"}',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    'news', '18'
  )
) as v(slug, title, excerpt, content, cover_image, category, days_ago)
on conflict (slug) do nothing;
