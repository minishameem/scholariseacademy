/* =====================================================================
   SCHOLARISE LEARNING LIBRARY – DATA
   ---------------------------------------------------------------------
   This is the ONLY file you edit to add, change or remove resources.
   The page (library/index.html) reads this file and builds every card,
   category, filter and count automatically.

   ---------------------------------------------------------------------
   HOW TO ADD A RESOURCE
   1. Copy one of the templates at the bottom of this file.
   2. Paste it inside the `resources: [ ... ]` list below.
   3. Fill in the fields. Leave out any optional field you do not need.
   4. Set `published: true`. Save. Upload the site as usual.

   ACCESS TYPES (exactly one per resource)
   - 'free'          → badge FREE, button "Download PDF ↓" (needs resourceUrl)
   - 'enrolled_only' → badge ONLY FOR ENROLLED LEARNERS, no button, no link
   - 'external'      → badge EXTERNAL RESOURCE, button "Visit Website ↗" (needs resourceUrl)

   SECURITY: never put a private file link in an 'enrolled_only' resource.
   This file is public: anyone can open it in a browser. The page also
   refuses to show a resourceUrl on enrolled_only resources.

   FIELDS
   id           required  unique, never change it later (e.g. 'letter-sound-practice')
   title        required
   description  required  one or two sentences
   category     required  one of the category ids below (e.g. 'phonics-early-literacy')
   accessType   required  'free' | 'enrolled_only' | 'external'
   published    required  true to show it, false to hide it
   resourceUrl  free/external only: full https:// link (Google Drive, website…)
   image        optional  e.g. '../assets/library/letter-sound-practice.webp' or https:// URL
   format       optional  e.g. 'PDF', 'Worksheet', 'Website', 'Book', 'Video', 'Activity'
   level        optional  e.g. 'Beginner', 'Basic', 'Intermediate', 'Advanced'
   gradeRange   optional  e.g. 'Grades 1–2'
   ageRange     optional  e.g. 'Ages 6–7'
   skills       optional  list, e.g. ['Phonics', 'Letter sounds']
   tags         optional  list of extra search words
   ctaLabel     optional  replaces the default button text
   publisher    optional  external only: website or provider name (verified)
   pricingType  optional  external only: 'free' | 'paid' | 'subscription' (only if verified)
   featured     optional  true → also shown under "Featured Materials"
   dateAdded    optional  'YYYY-MM-DD' (enables "Newest" sorting)
   sortOrder    optional  number; lower numbers appear first in "Recommended"
   ===================================================================== */

window.SCHOLARISE_LIBRARY = {

  /* ------------------------------------------------------------------
     CATEGORIES
     `id` is permanent: resources point to it. You can safely change
     `title`, `description`, `icon` or `order` at any time.
     icon options: phonics, grammar, reading, writing, speaking,
                   activity, parents, insights, external
     ------------------------------------------------------------------ */
  categories: [
    { id: 'phonics-early-literacy', title: 'Phonics & Early Literacy', icon: 'phonics',  order: 1,
      description: 'Letter sounds, blending and first steps in reading.' },
    { id: 'grammar-vocabulary',     title: 'Grammar & Vocabulary',     icon: 'grammar',  order: 2,
      description: 'Structures and words that make meaning clear.' },
    { id: 'reading-books',          title: 'Reading & Books',          icon: 'reading',  order: 3,
      description: 'Stories, texts and reading practice for every stage.' },
    { id: 'writing',                title: 'Writing',                  icon: 'writing',  order: 4,
      description: 'From sentences to paragraphs and longer texts.' },
    { id: 'speaking-listening',     title: 'Speaking & Listening',     icon: 'speaking', order: 5,
      description: 'Conversation, pronunciation and listening practice.' },
    { id: 'learning-activities',    title: 'Learning Activities',      icon: 'activity', order: 6,
      description: 'Games, tasks and hands-on language practice.' },
    { id: 'parents',                title: 'Resources for Parents',    icon: 'parents',  order: 7,
      description: 'Practical guidance for supporting learning at home.' },
    { id: 'learning-insights',      title: 'Learning Insights',        icon: 'insights', order: 8,
      description: 'Short reads on how learners learn English.' },
    { id: 'external',               title: 'Trusted External Resources', icon: 'external', order: 9,
      description: 'Carefully chosen websites and tools from other providers.' }
  ],

  /* ------------------------------------------------------------------
     RESOURCES
     Empty for now. The page shows a designed empty state until the
     first published resource is added here.
     ------------------------------------------------------------------ */
  resources: [

  ]
};

/* =====================================================================
   TEMPLATES – copy one into `resources` above, then edit.
   (These are comments, so they never appear on the website.)

   // 1. Free PDF from Google Drive
   {
     id: 'letter-sound-practice',
     title: 'Letter Sound Practice',
     description: 'Match each letter to its sound with picture clues.',
     category: 'phonics-early-literacy',
     accessType: 'free',
     resourceUrl: 'https://drive.google.com/file/d/YOUR-FILE-ID/view',
     image: '../assets/library/letter-sound-practice.webp',
     format: 'PDF',
     gradeRange: 'Grades 1–2',
     skills: ['Phonics', 'Letter sounds'],
     dateAdded: '2026-10-20',
     published: true
   },

   // 2. Only for enrolled learners (no link: shared directly in class)
   {
     id: 'past-tense-workbook-intermediate',
     title: 'Past Tense Workbook',
     description: 'Guided practice with regular and irregular past tense verbs.',
     category: 'grammar-vocabulary',
     accessType: 'enrolled_only',
     level: 'Intermediate',
     gradeRange: 'Grades 3–5',
     format: 'Workbook',
     published: true
   },

   // 3. External website
   {
     id: 'example-reading-site',
     title: 'Name of the website',
     description: 'What learners will find there and why it is useful.',
     category: 'external',
     accessType: 'external',
     resourceUrl: 'https://www.example.org/',
     publisher: 'Provider name',
     pricingType: 'free',          // only if you have checked it
     format: 'Website',
     published: true
   },
   ===================================================================== */
