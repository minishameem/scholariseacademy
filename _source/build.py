import re, os, shutil, html

OLD = open('/home/claude/site/index.html', encoding='utf-8').read()
OUT = '/home/claude/build/dist'

def grab(pattern):
    m = re.search(pattern, OLD, re.S)
    assert m, pattern
    return m.group(0)

# ---------- reuse approved artwork from the current page ----------
HERO_IMG = grab(r'<img src="assets/images/hero-learner\.png"[^>]*>')
BOOK = grab(r'<svg class="hero-book".*?</svg>')
YARROW = grab(r'<svg class="hero-arrow-yellow".*?</svg>')
BULB = grab(r'<svg class="hero-bulb".*?</svg>')
GARROW = grab(r'<svg class="hero-arrow-green".*?</svg>')
SWOOSH = grab(r'<svg class="hero-swoosh".*?</svg>')
def drawable(svg, delay):
    svg = svg.replace('<path ', '<path pathLength="1" ')
    return svg.replace('aria-hidden="true"', 'aria-hidden="true" style="--dd:%s"' % delay, 1).replace('class="', 'class="draw ', 1)
YARROW, GARROW, SWOOSH = drawable(YARROW, '1.3s'), drawable(GARROW, '1.6s'), drawable(SWOOSH, '.9s')
PHIL_MEDIA = grab(r'<div class="philosophy-media">.*?</div>')
BOX_ICON = grab(r'<span class="box-icon" aria-hidden="true">.*?</span>')
CARDS = re.findall(r'<article class="belief-card.*?</article>', OLD, re.S)
assert len(CARDS) == 8
CARDS = [c.replace('<article class="belief-card', '<article data-reveal class="belief-card') for c in CARDS]
SPARK_L = grab(r'<svg class="title-spark left".*?</svg>')
SPARK_R = grab(r'<svg class="title-spark right".*?</svg>')
def inner_svg(cls):
    return re.search(r'<a href="#" class="%s"[^>]*>(<svg.*?</svg>)</a>' % cls, OLD, re.S).group(1)
FB_SVG, LI_SVG, WA_SVG = inner_svg('fb'), inner_svg('li'), inner_svg('wa')
SHIELD = re.search(r'<p class="privacy">(<svg.*?</svg>)', OLD, re.S).group(1)
MAIL_SMALL = grab(r'<svg class="mail".*?</svg>')
PLANE = grab(r'<svg class="plane".*?</svg>')
LOC_SVG = re.search(r'<li class="ci-loc">\s*(<svg.*?</svg>)', OLD, re.S).group(1)
MAILW_SVG = re.search(r'<li class="ci-mail">\s*(<svg.*?</svg>)', OLD, re.S).group(1)
CLOCK_SVG = re.search(r'<li class="ci-time">\s*(<svg.*?</svg>)', OLD, re.S).group(1)

# ---------- small icon set ----------
def ico(d, extra=''):
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s%s</svg>' % (''.join('<path d="%s"/>' % p for p in d.split('|')), extra)
I = {
 'arrow': ico('M5 12h14|M13 6l6 6-6 6'),
 'cap': ico('M2 9.5 12 5l10 4.5-10 4.5z|M6 11.5v4.5c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5|M22 9.5v5'),
 'user': ico('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M4.5 20a7.5 7.5 0 0 1 15 0'),
 'bars': ico('M5 20v-5|M12 20V10|M19 20V4'),
 'book': ico('M12 7c-2-1.6-5-2.2-8-1.8v13c3-.4 6 .2 8 1.8 2-1.6 5-2.2 8-1.8v-13c-3-.4-6 .2-8 1.8z|M12 7v13'),
 'chat': ico('M4 5h16v11H9l-5 4z|M8 9.5h8|M8 12.5h5'),
 'phonics': '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="16.8" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="700" font-size="12.5" fill="currentColor">Aa</text><path d="M5 20.5h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
 'group': ico('M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z|M2.5 20a6.5 6.5 0 0 1 13 0|M16 4.5a3.5 3.5 0 0 1 0 6.5|M18 14.2a6.5 6.5 0 0 1 3.5 5.8'),
 'pair': ico('M7.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M16.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M2.5 19a5 5 0 0 1 10 0|M11.5 19a5 5 0 0 1 10 0'),
 'custom': ico('M4 6h10|M18 6h2|M4 12h4|M12 12h8|M4 18h12|M20 18h0|M14 4v4|M8 10v4|M16 16v4'),
 'mail': ico('M3.5 5.5h17v13h-17z|M4 6.5l8 6 8-6'),
 'phone': ico('M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z'),
 'fb': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21z"/></svg>',
 'li': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.3 9.4h2.6v8.4H6.3zM7.6 5.2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM10.6 9.4h2.5v1.2c.4-.7 1.2-1.4 2.6-1.4 2.7 0 3.2 1.8 3.2 4.1v4.5h-2.6v-4c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1v4.1h-2.6z"/></svg>',
 'spark': ico('M12 3v4|M12 17v4|M3 12h4|M17 12h4|M6 6l2.5 2.5|M15.5 15.5 18 18|M18 6l-2.5 2.5|M8.5 15.5 6 18'),
 'question': ico('M9.2 9a3 3 0 1 1 4.3 2.7c-.9.4-1.5 1.2-1.5 2.2v.6|M12 18h.01'),
 'target': ico('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z|M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M12 12h.01'),
 'compass': ico('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z|M15.5 8.5l-2 5-5 2 2-5z'),
 'sprout': ico('M12 21v-9|M12 12c-4.5 0-7-2.5-7-7 4.5 0 7 2.5 7 7z|M12 14c3.5 0 6-2 6-6-3.5 0-6 2-6 6z'),
 'flag': ico('M5 21V4|M5 4h11l-2 4 2 4H5'),
}
CHECK = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="#349C5C"/><path d="M5.8 10.3l2.8 2.8 5.6-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
CHECK_DARK = CHECK.replace('#349C5C', '#9fe0b8').replace('stroke="#fff"', 'stroke="#035643"')

# ---------- shared layout ----------
def header(P, page):
    home = page == 'home'
    items = [('Home', 'home'), ('Why Scholarise', 'why-scholarise'), ('How We Teach', 'how-we-teach'), ('Courses', 'courses')]
    lis = []
    for label, sid in items:
        cls = ' class="is-active" aria-current="page"' if (home and sid == 'home') else ''
        spy = ' data-spy="%s"' % sid if home else ''
        lis.append('<li><a href="%s#%s"%s%s>%s</a></li>' % (P, sid, spy, cls, label))
    ccls = ' class="is-active" aria-current="page"' if page == 'contact' else ''
    lis.append('<li><a href="%scontactus/"%s>Contact</a></li>' % (P, ccls))
    return '''<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="%(home)s" aria-label="Scholarise Academy home"><img src="%(P)sassets/images/scholarise-logo.png" alt="Scholarise Academy" width="182" height="44"></a>
    <button class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav"><span></span><span></span><span></span></button>
    <nav class="main-nav" id="main-nav" aria-label="Main navigation">
      <ul>%(lis)s</ul>
      <a href="%(P)scontactus/" class="btn btn-primary">Enroll Now</a>
    </nav>
  </div>
</header>''' % {'P': P, 'home': '#home' if home else P, 'lis': ''.join(lis)}

def footer(P):
    t = lambda track: 'href="%s?track=%s#courses" data-track-link="%s"' % (P, track, track)
    return '''<footer class="site-footer">
  <div class="footer-main">
    <div class="container footer-grid" data-stagger="110">
      <div class="footer-brand" data-reveal>
        <img src="%(P)sassets/images/scholarise-logo-footer.png" alt="Scholarise" width="200" height="48">
        <span class="footer-rule" aria-hidden="true"></span>
        <p>Meaningful English learning for brighter learners and brighter tomorrows.</p>
        <ul class="social" aria-label="Social media">
          <li><a class="fb" href="https://www.facebook.com/scholariseacademy" target="_blank" rel="noopener" aria-label="Scholarise on Facebook">%(fb)s</a></li>
          <li><a class="li" href="https://www.linkedin.com/company/scholariseacademy" target="_blank" rel="noopener" aria-label="Scholarise on LinkedIn">%(li)s</a></li>
          <li><a class="em" href="mailto:contact.scholariseacademy@gmail.com" aria-label="Email Scholarise">%(mail)s</a></li>
        </ul>
      </div>
      <div class="footer-col" data-reveal>
        <h4>Quick Links</h4>
        <ul>
          <li><a href="%(P)s#home">Home</a></li>
          <li><a href="%(P)saboutus/">About Us</a></li>
          <li><a href="%(P)s#how-we-teach">What We Believe</a></li>
          <li><a href="%(P)s#courses">Courses</a></li>
          <li><a href="%(P)scontactus/">Contact Us</a></li>
        </ul>
      </div>
      <div class="footer-col" data-reveal>
        <h4>Our Courses</h4>
        <ul>
          <li><details><summary>English Grammar Course</summary><ul>
            <li><a %(g)s>Basic <small>Grades 1-2</small></a></li>
            <li><a %(g)s>Intermediate <small>Grades 3-5</small></a></li>
            <li><a %(g)s>Advanced <small>Grades 6-8</small></a></li>
          </ul></details></li>
          <li><details><summary>English Speaking Course</summary><ul>
            <li><a %(s)s>Basic <small>Grades 1-2</small></a></li>
            <li><a %(s)s>Intermediate <small>Grades 3-5</small></a></li>
            <li><a %(s)s>Advanced <small>Grades 6-8</small></a></li>
          </ul></details></li>
          <li><a %(ph)s>English Phonics Foundation</a></li>
        </ul>
      </div>
      <div class="footer-col" data-reveal>
        <h4>Support</h4>
        <ul>
          <li><a href="%(P)sterms&amp;condition/">Terms &amp; Conditions</a></li>
          <li><a href="%(P)scontactus/">Contact Us</a></li>
          <li><a href="%(P)saboutus/">About Us</a></li>
          <li><a href="%(P)sblogs/">Blogs</a></li>
          <li><a href="%(P)sprivacypolicy/">Privacy Policy</a></li>
        </ul>
      </div>
      <div class="newsletter" data-reveal>
        %(plane)s
        <h4>Stay in the Loop</h4>
        <p>Get updates on new courses, learning resources, and special announcements.</p>
        <form class="subscribe" novalidate>
          <div class="input-wrap">
            %(mailsm)s
            <label class="sr-only" for="nl-email">Email address</label>
            <input id="nl-email" type="email" name="email" placeholder="Your email address" autocomplete="email" required>
          </div>
          <button type="submit" class="btn btn-primary btn-subscribe">Subscribe %(arrow)s</button>
        </form>
        <p class="privacy">%(shield)sWe respect your privacy. No spam, ever.</p>
        <p class="nl-status" role="status" aria-live="polite"></p>
      </div>
    </div>
    <img class="leaves leaves-left" src="%(P)sassets/images/leaves-left.png" alt="" width="118" height="61">
    <img class="leaves leaves-right" src="%(P)sassets/images/leaves-right.png" alt="" width="105" height="91">
  </div>
  <div class="footer-bar">
    <div class="container">
      <ul class="contact-strip">
        <li>%(loc)s<span>Dhaka, Bangladesh<small>(Online First)</small></span></li>
        <li>%(mailw)s<span><a href="mailto:contact.scholariseacademy@gmail.com">contact.scholariseacademy@gmail.com</a><small>We usually reply within 24 hours.</small></span></li>
        <li>%(clock)s<span>Sun - Thu, 9:00 AM - 6:00 PM<small>(GMT+6)</small></span></li>
      </ul>
      <div class="bar-bottom">
        <p>© 2026 Scholarise Academy. All rights reserved.</p>
        <ul class="legal-links">
          <li><a href="%(P)sprivacypolicy/">Privacy Policy</a></li>
          <li><a href="%(P)sterms&amp;condition/">Terms &amp; Conditions</a></li>
        </ul>
      </div>
    </div>
  </div>
</footer>
<a class="wa-float js-whatsapp" href="https://wa.me/" target="_blank" rel="noopener" aria-label="Chat with Scholarise on WhatsApp">%(wa)s<span class="wa-tip">Chat on WhatsApp</span></a>''' % {
        'P': P, 'fb': I['fb'], 'li': I['li'], 'mail': I['mail'], 'g': t('grammar'), 's': t('speaking'), 'ph': t('phonics'),
        'plane': PLANE, 'mailsm': MAIL_SMALL, 'arrow': I['arrow'], 'shield': SHIELD, 'loc': LOC_SVG, 'mailw': MAILW_SVG,
        'clock': CLOCK_SVG, 'wa': WA_SVG}

def page(P, page_id, title, desc, body):
    return '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>%s</title>
  <meta name="description" content="%s">
  <meta name="theme-color" content="#035643">
  <link rel="stylesheet" href="%sassets/css/style.css">
  <script>document.documentElement.classList.add('js')</script>
</head>
<body class="page-%s">
%s
<main id="main">
%s
</main>
%s
<script src="%sassets/js/main.js"></script>
</body>
</html>
''' % (title, desc, P, page_id, header(P, page_id), body, footer(P), P)

def page_hero(P, crumb, eyebrow, title, leads, art=None, extra=''):
    art_html = '<div class="page-hero-art" data-reveal="zoom">%s</div>' % art if art else ''
    return '''<section class="page-hero%s">
  <span class="bg-ring" aria-hidden="true"></span>
  <div class="container">
    <div data-stagger="110">
      <nav class="crumbs" aria-label="Breadcrumb" data-reveal><a href="%s">Home</a><span aria-hidden="true">/</span><span>%s</span></nav>
      <p class="eyebrow" data-reveal>%s</p>
      <h1 class="page-title" data-reveal>%s</h1>
      %s
      %s
    </div>
    %s
  </div>
</section>''' % ('' if art else ' is-simple', P, crumb, eyebrow, title,
                 ''.join('<p class="page-lead" data-reveal>%s</p>' % l for l in leads), extra, art_html)

# =========================================================
# HOME
# =========================================================
COURSES = [
    ('phonics', 'Phonics', 'English Phonics Foundation', None, 'Pre-primary, 1-2', '4–6'),
    ('grammar', 'Grammar', 'English Grammar Course', 'Basic', '1-2', '6-7'),
    ('grammar', 'Grammar', 'English Grammar Course', 'Intermediate', '3-5', '8-10'),
    ('grammar', 'Grammar', 'English Grammar Course', 'Advanced', '6-8', '11-14'),
    ('speaking', 'Speaking', 'English Speaking Course', 'Basic', '1-2', '6-7'),
    ('speaking', 'Speaking', 'English Speaking Course', 'Intermediate', '3-5', '8-10'),
    ('speaking', 'Speaking', 'English Speaking Course', 'Advanced', '6-8', '11-14'),
]
LEVELS = {'Basic': 1, 'Intermediate': 2, 'Advanced': 3}
ICON_FOR = {'phonics': I['phonics'], 'grammar': I['book'], 'speaking': I['chat']}

def course_card(P, c):
    track, track_label, name, level, grades, age = c
    rows = []
    if level:
        rows.append('<div>%s<dt>Level</dt><dd>%s</dd></div>' % (I['bars'], level))
    rows.append('<div>%s<dt>Grades</dt><dd>%s</dd></div>' % (I['cap'], grades))
    rows.append('<div>%s<dt>Recommended Age</dt><dd>%s</dd></div>' % (I['user'], age))
    meter = ''
    if level:
        meter = '<div class="level-meter" aria-hidden="true">%s</div>' % ''.join('<i class="on"></i>' if i < LEVELS[level] else '<i></i>' for i in range(3))
    badge = '<span class="course-level">%s</span>' % level if level else ''
    if not level:  # the single phonics course gets a full-width card
        return '''<article class="course-card is-wide" data-track="%s" data-reveal>
        <div class="course-head"><span class="course-icon">%s</span><div><p class="course-track">%s</p><h3>%s</h3></div></div>
        <dl class="course-info">%s</dl>
        <a class="course-link" href="%scontactus/" aria-label="Enroll in %s">Enroll Now %s</a>
      </article>''' % (track, ICON_FOR[track], track_label, name, ''.join(rows), P, name, I['arrow'])
    return '''<article class="course-card" data-track="%s" data-reveal>
        <div class="course-top"><span class="course-icon">%s</span>%s</div>
        <p class="course-track">%s</p>
        <h3>%s</h3>
        %s
        <dl class="course-info">%s</dl>
        <a class="course-link" href="%scontactus/" aria-label="Enroll in %s%s">Enroll Now %s</a>
      </article>''' % (track, ICON_FOR[track], badge, track_label, name, meter, ''.join(rows), P, name, (' – ' + level) if level else '', I['arrow'])

PLANS = [
    ('group', 'Small Group', 'Learn Together', 'BDT 3,000/=', False,
     ['Weekly 2 Live Classes', 'Up to 8 Learners Per Batch', '1 Hour 20 Minutes Class time', 'PDF Learning Materials', 'Class Recording Provided', 'Monthly Parent Meeting']),
    ('pair', 'One to One', 'Learn Your Way', 'BDT 7,000/=', True,
     ['Weekly 2 Live Classes', 'One Learner + One Teacher', '1 Hour 20 Minutes Class time', 'PDF Learning Materials', 'Class Recording Provided', 'Monthly Parent Meeting']),
    ('custom', 'Custom Learning', 'Built Around Your Needs', 'BDT 10,000/=', False,
     ['Weekly 2 Live Classes', 'One Learner + One Teacher', '1 Hour 20 Minutes Class Time', 'Custom PDF Learning Materials', 'Custom Learning Plan', 'Personalised Homework & Practice', 'Class Recording Provided', 'Monthly Parent Meeting']),
]
def price_card(P, p):
    icon, name, tag, price, dark, feats = p
    chk = CHECK_DARK if dark else CHECK
    return '''<article class="price-card%s" data-reveal>
        <span class="plan-icon">%s</span>
        <h3 class="plan-name">%s</h3>
        <p class="plan-tag">%s</p>
        <p class="plan-price"><strong>%s</strong><span>Per Month</span></p>
        <ul class="plan-features">%s</ul>
        <a class="btn %s" href="%scontactus/">Enroll Now %s</a>
      </article>''' % (' is-dark' if dark else '', I[icon], name, tag, price,
                       ''.join('<li>%s<span>%s</span></li>' % (chk, html.escape(f, quote=False)) for f in feats),
                       'btn-light' if dark else 'btn-primary', P, I['arrow'])

def home():
    P = ''
    body = '''<section class="hero" id="home">
  <span class="hero-shape s3" aria-hidden="true"></span><span class="hero-shape s1" aria-hidden="true"></span><span class="hero-shape s2" aria-hidden="true"></span>
  <div class="container hero-inner">
    <div class="hero-copy">
      <p class="hero-eyebrow">WELCOME TO THE SCHOLARISE UNIVERSE</p>
      <h1 class="hero-title">
        <span class="l1">We Don’t Just Teach English.</span>
        <span class="l2">We Build the Ability to</span>
        <span class="l3">Think in English.%(swoosh)s</span>
      </h1>
      <p class="hero-text">Every learner is understood, every lesson has a<br class="d"> purpose, and English becomes a natural part of<br class="d"> how you think, communicate, and<br class="d"> connect with the world.</p>
      <div class="hero-actions"><a href="#courses" class="btn btn-primary">Explore Our Courses %(arrow)s</a></div>
    </div>
    <div class="hero-visual">
      %(img)s
      %(book)s
      %(yarrow)s
      %(bulb)s
      %(garrow)s
    </div>
  </div>
</section>

<section class="philosophy" id="why-scholarise">
  <div class="container">
    <h2 class="philosophy-eyebrow" data-reveal>OUR TEACHING PHILOSOPHY</h2>
    <div class="philosophy-body">
      <div data-reveal="left">%(philmedia)s</div>
      <div class="philosophy-copy" data-reveal="right">
        <h3 class="philosophy-title">Learning Should Be<br> Something Learners<br> Want to <span class="accent">Come Back To.</span></h3>
        <p>At Scholarise, we believe learning should not be built around<br class="d"> <strong>fear, boredom, pressure, or the constant feeling of “I have<br class="d"> to study.”</strong></p>
        <p>For young learners, curiosity is not a distraction from learning,<br class="d"> it is one of the forces that makes meaningful learning possible.</p>
        <p>That is why we think beyond simply teaching English. We think<br class="d"> about how a learner <strong>feels, thinks, participates, explores,</strong> and<br class="d"> <strong>responds</strong> while learning.</p>
        <div class="philosophy-box" data-reveal="zoom">
          %(boxicon)s
          <p class="box-label">OUR PHILOSOPHY IS SIMPLE :</p>
          <p class="box-text">When learners genuinely want to learn, they engage more deeply, participate more freely, and build stronger connections with what they learn.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="believe" id="how-we-teach">
  <div class="container">
    <div class="section-head" data-reveal>
      %(sparkl)s%(sparkr)s
      <h2 class="believe-title">What We Believe</h2>
      <p class="believe-sub">These core beliefs guide everything we do at Scholarise.<br> They shape the way we design, teach, and support every learning experience.</p>
    </div>
    <div class="belief-grid" data-stagger="90">
      %(cards)s
    </div>
  </div>
</section>

<section class="section courses" id="courses">
  <div class="container">
    <div class="section-head" data-reveal>
      <h2 class="section-title">Explore Our Courses</h2>
    </div>
    <div class="course-tabs" role="group" aria-label="Filter courses" data-reveal>
      <button class="course-tab" type="button" data-filter="all" aria-pressed="true">All Courses</button>
      <button class="course-tab" type="button" data-filter="phonics" aria-pressed="false">Phonics</button>
      <button class="course-tab" type="button" data-filter="grammar" aria-pressed="false">Grammar</button>
      <button class="course-tab" type="button" data-filter="speaking" aria-pressed="false">Speaking</button>
    </div>
    <div class="course-grid" data-stagger="80">
      %(courses)s
    </div>
  </div>
</section>

<section class="section pricing" id="pricing">
  <div class="container">
    <div class="section-head" data-reveal>
      <h2 class="section-title">Pricing Plan</h2>
    </div>
    <div class="price-grid" data-stagger="130">
      %(plans)s
    </div>
  </div>
</section>''' % {
        'swoosh': SWOOSH, 'arrow': I['arrow'], 'img': HERO_IMG, 'book': BOOK, 'yarrow': YARROW, 'bulb': BULB, 'garrow': GARROW,
        'philmedia': PHIL_MEDIA, 'boxicon': BOX_ICON, 'sparkl': SPARK_L, 'sparkr': SPARK_R, 'cards': '\n      '.join(CARDS),
        'courses': '\n      '.join(course_card(P, c) for c in COURSES), 'plans': '\n      '.join(price_card(P, p) for p in PLANS)}
    return page(P, 'home', 'Scholarise Academy | English Learning for Young Learners',
                'Scholarise Academy. We don’t just teach English. We build the ability to think in English.', body)

# =========================================================
# ABOUT
# =========================================================
ABOUT_ART = '''<svg viewBox="0 0 460 400" role="img" aria-label="Illustration of an open book with questions and ideas">
  <path d="M58 214c0-98 82-172 184-172 100 0 170 72 170 164 0 96-74 170-176 170C136 376 58 310 58 214z" fill="#d6f2e0"/>
  <circle cx="92" cy="96" r="7" fill="#F8BD25"/><circle cx="404" cy="300" r="9" fill="#349C5C" opacity=".4"/><circle cx="40" cy="300" r="5" fill="#035643" opacity=".3"/>
  <g class="float">
    <rect x="70" y="118" width="120" height="78" rx="22" fill="#fff"/><path d="M104 196l-10 24 30-24z" fill="#fff"/>
    <text x="130" y="173" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="700" font-size="46" fill="#035643">?</text>
  </g>
  <g class="float-2">
    <rect x="286" y="70" width="114" height="100" rx="24" fill="#035643"/><path d="M306 170l-6 26 28-26z" fill="#035643"/>
    <path d="M343 95a18 18 0 0 0-10.7 32.4c1.8 1.4 2.7 3.2 2.7 5.3v4h16v-4c0-2.1.9-3.9 2.7-5.3A18 18 0 0 0 343 95z" fill="none" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="M336 145h14M339 151h8" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M343 80v-7M322 88l-5-5M364 88l5-5" stroke="#F8BD25" stroke-width="3.4" stroke-linecap="round"/>
  </g>
  <g>
    <path d="M230 262c-34-20-78-26-122-20v94c44-6 88 0 122 20 34-20 78-26 122-20v-94c-44-6-88 0-122 20z" fill="#fff" stroke="#035643" stroke-width="5" stroke-linejoin="round"/>
    <path d="M230 262v94" stroke="#035643" stroke-width="5"/>
    <path d="M132 270c26-3 52 0 74 9M132 292c26-3 52 0 74 9M132 314c26-3 52 0 74 9M328 270c-26-3-52 0-74 9M328 292c-26-3-52 0-74 9M328 314c-26-3-52 0-74 9" stroke="#349C5C" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M230 236v-14M204 242l-7-11M256 242l7-11" stroke="#F8BD25" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>'''

def about():
    P = '../'
    hero = page_hero(P, 'About Us', 'About Us', 'We’re Building a Different Kind of Learning Experience.',
        ['Scholarise began with a simple question:'], ABOUT_ART,
        '''<div class="question-card" data-reveal><span class="qmark" aria-hidden="true">?</span><p>What if learning English could be designed around the learner—not just around the curriculum?</p></div>
      <p class="page-lead" data-reveal>We believe young learners deserve more than lessons that ask them to listen, memorise, and reproduce. They deserve learning experiences that make them think, communicate, explore, make mistakes, ask questions, and gradually become more independent.</p>
      <p class="page-lead" data-reveal><strong>That belief shapes everything we do.</strong></p>''')
    nodes = ['Pace', 'Personality', 'Interest', 'Level of confidence', 'Prior knowledge', 'Way of engaging with the world']
    body = hero + '''
<section class="section">
  <div class="container split">
    <div class="prose" data-reveal="left">
      <h2 class="section-title">Learning Begins With Understanding the Learner</h2>
      <p>Before we decide what to teach, we think about who we are teaching.</p>
      <p>Every learner brings a different pace, personality, interest, level of confidence, prior knowledge, and way of engaging with the world.</p>
      <p>So we don't believe in simply taking the same lesson and giving it to everyone.</p>
      <p class="callout">%(sprout)s We adapt the learning—not the learner.</p>
    </div>
    <div class="learner-diagram" data-reveal="zoom" role="img" aria-label="Diagram: every learner brings a different pace, personality, interest, level of confidence, prior knowledge and way of engaging with the world">
      <span class="orbit" aria-hidden="true"></span>
      <div class="learner-core">Every learner</div>
      %(nodes)s
    </div>
  </div>
</section>

<section class="section" style="background:var(--light)">
  <div class="container">
    <div class="section-head" data-reveal>
      <h2 class="section-title">Where Research Meets Real Classrooms</h2>
      <p class="section-sub">Scholarise is built on an evidence-informed approach to language education.</p>
    </div>
    <div class="prose" style="max-width:760px;margin:0 auto;text-align:center" data-reveal>
      <p>We draw from learning science, TESOL research, learner psychology, classroom research, and educational practice to continuously question how learning can be made more meaningful and effective.</p>
      <p>But research alone doesn't teach a learner.</p>
    </div>
    <div class="flow" data-stagger="140">
      <ul class="flow-sources" data-reveal="left">
        <li class="flow-chip"><i></i>Learning science</li>
        <li class="flow-chip"><i></i>TESOL research</li>
        <li class="flow-chip"><i></i>Learner psychology</li>
        <li class="flow-chip"><i></i>Classroom research</li>
        <li class="flow-chip"><i></i>Educational practice</li>
      </ul>
      <span class="flow-arrow" aria-hidden="true"></span>
      <div class="flow-question" data-reveal="zoom"><small>We take what research tells us and ask:</small><p>“What does this look like in a real classroom?”</p></div>
      <span class="flow-arrow" aria-hidden="true"></span>
      <div class="flow-end" data-reveal="right">%(flag)sThat is where our work begins.</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head" data-reveal>
      <h2 class="section-title">We Care About What Happens Beyond the Lesson</h2>
      <p class="section-sub">A successful lesson isn't simply one where a learner gets the answers right.<br>We want to see what happens afterwards.</p>
    </div>
    <div class="q-grid" data-stagger="110">
      <div class="q-card" data-reveal><span class="q-num">01</span><p>Can they use the language somewhere new?</p></div>
      <div class="q-card" data-reveal><span class="q-num">02</span><p>Can they express an idea without being prompted?</p></div>
      <div class="q-card" data-reveal><span class="q-num">03</span><p>Can they remember it later?</p></div>
      <div class="q-card" data-reveal><span class="q-num">04</span><p>Can they approach something unfamiliar with more confidence?</p></div>
    </div>
    <div class="beyond-close" data-reveal>
      <p>Because ultimately, we are not preparing learners only for the next class.</p>
      <p>We are helping them become more capable learners for everything that comes after it.</p>
    </div>
  </div>
</section>

<section class="section" style="background:linear-gradient(180deg,#fff,var(--light))">
  <div class="container split reverse">
    <div class="prose" data-reveal="right">
      <h2 class="section-title">What We’re Building</h2>
      <p>Scholarise is more than a place to learn English.</p>
      <p>We are building a learning environment where:</p>
      <ul class="build-list" data-stagger="100">
        <li data-reveal><span>%(spark)s</span>curiosity is welcomed,</li>
        <li data-reveal><span>%(question)s</span>questions are valued,</li>
        <li data-reveal><span>%(target)s</span>mistakes have a purpose,</li>
        <li data-reveal><span>%(compass)s</span>learning has intention,</li>
        <li data-reveal><span>%(sprout)s</span>and every learner is given room to grow.</li>
      </ul>
      <p>We want learning to be something learners experience, not simply something they are expected to complete.</p>
    </div>
    <div data-reveal="left"><img src="../assets/images/philosophy-learner.png" alt="A young learner writing in a notebook" width="564" height="586" style="width:100%%;max-width:520px;margin:0 auto"></div>
  </div>
</section>

<section class="section promise">
  <span class="ring r1" aria-hidden="true"></span><span class="ring r2" aria-hidden="true"></span>
  <div class="container" style="position:relative">
    <h2 class="section-title" data-reveal>Our Promise</h2>
    <div class="promise-lines" data-stagger="160">
      <p data-reveal>We may not have every answer.</p>
      <p data-reveal>But we promise to keep asking better questions.</p>
      <p data-reveal>To keep learning.</p>
      <p data-reveal>To keep improving.</p>
      <p data-reveal>And to keep looking for better ways to help every learner move forward.</p>
    </div>
    <p class="promise-quote" data-reveal="zoom">Because better education begins when we stop asking,<br>“How do we teach this?”<br>and start asking,<br><em>“How does this learner learn best?”</em></p>
    <div class="cta-row" data-reveal>
      <a class="btn btn-light" href="../#courses">Explore Our Courses %(arrow)s</a>
      <a class="btn btn-outline" style="color:#fff;box-shadow:inset 0 0 0 2px #fff" href="../contactus/">Contact Us</a>
    </div>
  </div>
</section>''' % {'sprout': I['sprout'], 'nodes': ''.join('<span class="learner-node">%s</span>' % n for n in nodes), 'flag': I['flag'],
                  'spark': I['spark'], 'question': I['question'], 'target': I['target'], 'compass': I['compass'], 'arrow': I['arrow']}
    return page(P, 'about', 'About Us | Scholarise Academy', 'We’re building a different kind of learning experience.', body)

# =========================================================
# CONTACT
# =========================================================
CONTACT_ART = '''<svg viewBox="0 0 460 380" role="img" aria-label="Illustration of an envelope and chat messages">
  <path d="M40 200c0-92 78-160 176-160 102 0 196 62 196 158 0 94-84 154-190 154C120 352 40 290 40 200z" fill="#d6f2e0"/>
  <circle cx="400" cy="90" r="8" fill="#F8BD25"/><circle cx="70" cy="90" r="6" fill="#349C5C" opacity=".5"/>
  <g class="float">
    <rect x="110" y="150" width="240" height="160" rx="22" fill="#fff" stroke="#035643" stroke-width="5"/>
    <path d="M118 162l112 84 112-84" fill="none" stroke="#035643" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 280h60M150 262h36" stroke="#349C5C" stroke-width="5" stroke-linecap="round"/>
  </g>
  <g class="float-2">
    <rect x="266" y="58" width="150" height="70" rx="22" fill="#035643"/><path d="M296 128l-4 24 26-24z" fill="#035643"/>
    <circle cx="310" cy="93" r="7" fill="#fff"/><circle cx="341" cy="93" r="7" fill="#fff"/><circle cx="372" cy="93" r="7" fill="#fff"/>
  </g>
  <g class="float-2">
    <rect x="40" y="226" width="96" height="56" rx="18" fill="#349C5C"/><path d="M112 282l10 20-28-20z" fill="#349C5C"/>
    <path d="M62 254l10 10 20-20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>'''

def contact():
    P = '../'
    hero = page_hero(P, 'Contact Us', 'Contact Us', 'Let’s Start a Conversation About Your Learner.',
        ['Choosing the right learning environment is a big decision. If you have a question about our courses, teaching approach, enrolment, or simply want to understand whether Scholarise is the right fit for your learner, we’d love to hear from you.',
         '<strong>Tell us what you’re looking for. We’ll take it from there.</strong>'], CONTACT_ART)
    fields = [('parent', 'Parent / Guardian Name', 'text', True, 'name'), ('learner', 'Learner’s Name', 'text', True, 'off'),
              ('age', 'Learner’s Age', 'text', True, 'off'), ('email', 'Email Address', 'email', True, 'email'),
              ('phone', 'Phone / WhatsApp Number', 'tel', True, 'tel')]
    f_html = ''.join('<div class="field"><label for="f-%s">%s</label><input id="f-%s" name="%s" type="%s" autocomplete="%s"%s></div>' %
                     (n, l, n, n, t, a, ' required' if r else '') for n, l, t, r, a in fields)
    body = hero + '''
<section class="section">
  <div class="container contact-grid">
    <div data-reveal="left">
      <h2 class="contact-title">Get in Touch</h2>
      <div class="info-list" data-stagger="100">
        <a class="info-card" href="mailto:contact.scholariseacademy@gmail.com" data-reveal><span class="info-ic">%(mail)s</span><span><small>Email</small><strong>contact.scholariseacademy@gmail.com</strong></span></a>
        <div class="info-card" data-reveal><span class="info-ic">%(phone)s</span><span><small>Phone / WhatsApp</small><strong>+880 133</strong></span></div>
        <a class="info-card" href="https://www.facebook.com/scholariseacademy" target="_blank" rel="noopener" data-reveal><span class="info-ic">%(fb)s</span><span><small>Facebook</small><strong>https://www.facebook.com/scholariseacademy</strong></span></a>
        <a class="info-card" href="https://www.linkedin.com/company/scholariseacademy" target="_blank" rel="noopener" data-reveal><span class="info-ic">%(li)s</span><span><small>LinkedIn</small><strong>https://www.linkedin.com/company/scholariseacademy</strong></span></a>
      </div>
      <div class="hint-card" data-reveal>
        <h3>Not sure where to begin?</h3>
        <p><strong>That’s completely okay.</strong></p>
        <p>You don’t need to know which course your learner needs before reaching out.</p>
        <p>Tell us a little about your learner, what you’re looking for, or where you’re facing a challenge. We’ll help you find the right place to begin.</p>
      </div>
    </div>
    <form class="form-card" id="contact-form" novalidate data-reveal="right">
      <h2 class="contact-title">Have a Question?</h2>
      <p>Fill out the form and our team will get back to you.</p>
      <div class="form-grid">
        %(fields)s
        <div class="field full"><label for="f-message">Your Message</label><textarea id="f-message" name="message" required></textarea></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">Send Message %(arrow)s</button>
        <p class="form-status" role="status" aria-live="polite"></p>
      </div>
    </form>
  </div>
</section>''' % {'mail': I['mail'], 'phone': I['phone'], 'fb': I['fb'], 'li': I['li'], 'fields': f_html, 'arrow': I['arrow']}
    return page(P, 'contact', 'Contact Us | Scholarise Academy', 'Let’s start a conversation about your learner.', body)

# =========================================================
# TERMS
# =========================================================
TERMS = [
 ('Enrolment', [('p', 'When enrolling a learner, parents or legal guardians are responsible for providing accurate and up-to-date information.'), ('p', 'This may include:'),
   ('ul', ["Learner's name", 'Age or date of birth', 'Current educational level', 'Relevant learning information', 'Parent or guardian contact details', 'Other information reasonably required for the programme']),
   ('p', 'We reserve the right to request additional information where necessary to determine appropriate programme placement or provide the service effectively.')]),
 ('Programme Information', [('p', 'We make reasonable efforts to ensure that course descriptions, schedules, fees, materials, and other information published on our website are accurate.'), ('p', 'However, we may make reasonable changes to:'),
   ('ul', ['Course content', 'Learning materials', 'Class schedules', 'Teachers', 'Programme structure', 'Delivery methods']),
   ('p', 'where necessary to improve the learning experience or respond to operational requirements.'), ('p', 'We will provide appropriate notice where a significant change materially affects an enrolled learner.')]),
 ('Fees and Payment', [('p', 'Programme fees will be communicated before enrolment.'), ('p', 'By confirming enrolment, you agree to pay the applicable fee according to the payment terms provided by Scholarise.'), ('p', 'Unless otherwise stated:'),
   ('ul', ['Fees must be paid within the specified payment period.', 'Enrolment may not be confirmed until the required payment has been received.', 'Additional services or materials not included in the selected programme may carry separate charges.']),
   ('p', 'All applicable fees should be reviewed before completing enrolment.')]),
 ('Class Attendance', [('p', 'Regular attendance is important for meaningful learning.'), ('p', 'Parents or guardians are responsible for helping learners attend scheduled classes on time and ensuring they have access to the necessary device, internet connection, and learning environment.'),
   ('p', 'If a learner cannot attend a scheduled class, the parent or guardian should inform Scholarise as early as reasonably possible.'), ('p', "Any make-up class, recording, or alternative arrangement will depend on the programme's specific policy.")]),
 ('Online Learning Requirements', [('p', 'For online programmes, parents or guardians are responsible for ensuring that the learner has:'),
   ('ul', ['A suitable device', 'A stable internet connection', 'Access to required platforms', 'A reasonably appropriate learning environment', 'Any materials required for the programme']),
   ('p', "Scholarise is not responsible for interruptions caused by the learner's internet connection, device, software, or other circumstances outside our reasonable control.")]),
 ('Learning Materials', [('p', 'Learning materials provided by Scholarise may include:'),
   ('ul', ['PDFs', 'Worksheets', 'Presentations', 'Activities', 'Assessment materials', 'Videos', 'Digital resources', 'Other course-related content']),
   ('p', "Unless explicitly stated otherwise, these materials are provided for the enrolled learner's personal educational use."), ('p', 'Materials may not be:'),
   ('ul', ['Resold', 'Reproduced commercially', 'Distributed publicly', 'Uploaded to third-party platforms', 'Shared outside the intended learning purpose']),
   ('p', 'without written permission from Scholarise Academy.')]),
 ('Intellectual Property', [('p', 'The Scholarise Academy’s  name, logo, website content, course materials, written content, graphics, educational resources, frameworks, and other original materials are owned by or licensed to Scholarise Academy and are protected by applicable intellectual property laws.'),
   ('p', "Nothing in these Terms transfers ownership of Scholarise's intellectual property to a learner, parent, guardian, or other user.")]),
 ('Learner Participation', [('p', 'We encourage learners to participate actively and respectfully.'), ('p', 'Learners are expected to:'),
   ('ul', ['Attend classes appropriately', 'Participate in learning activities', 'Treat teachers and other learners respectfully', 'Follow reasonable classroom instructions', 'Avoid disruptive or inappropriate behaviour', 'Use learning platforms responsibly']),
   ('p', 'We believe a positive learning environment depends on mutual respect.')]),
 ('Parent and Guardian Responsibilities', [('p', 'Parents or legal guardians play an important role in supporting the learning experience.'), ('p', 'They are responsible for:'),
   ('ul', ['Providing accurate enrolment information', 'Supporting regular attendance', 'Reviewing relevant communication from Scholarise', 'Supporting appropriate use of learning platforms', 'Ensuring that account or access details are kept secure', "Informing Scholarise about relevant changes that may affect the learner's participation"])]),
 ('Assessments and Progress', [('p', 'Assessments may be used to understand learner progress and inform future teaching.'), ('p', 'Assessment results are intended to provide educational insight and should not be interpreted as a guarantee of a particular academic outcome.'),
   ('p', 'Learner progress may vary depending on factors including attendance, participation, practice, prior knowledge, learning needs, and individual circumstances.'), ('p', 'Scholarise Academy does not guarantee a specific grade, examination result, fluency level, or academic outcome.')]),
 ('Communication', [('p', 'Scholarise Academy may communicate with parents or guardians through email, phone, WhatsApp, learning platforms, or other communication channels provided during enrolment.'), ('p', 'Communication may include:'),
   ('ul', ['Class updates', 'Schedule information', 'Assessment information', 'Progress updates', 'Payment-related information', 'Programme announcements', 'Important administrative notices']),
   ('p', 'Parents or guardians are responsible for keeping their contact information up to date.')]),
 ('Photography, Video, and Recorded Content', [('p', 'Scholarise may occasionally use photographs, videos, recordings, learner work, or other content created during educational activities.'), ('p', 'Identifiable learner content may be used for public-facing promotional purposes.'),
   ('p', 'Any consent given for optional promotional use may be withdrawn subject to applicable law and practical limitations relating to materials already published.'), ('p', 'Participation in Scholarise programmes will not be made conditional on consenting to optional promotional use of identifiable learner content.')]),
 ('Privacy', [('p', 'Your use of Scholarise services is also subject to our Privacy Policy, which explains how we collect, use, store, and protect personal information.'), ('raw', '<p>Privacy Policy: <a href="../privacypolicy/">www.scholariseacademy.com/privacypolicy</a></p>')]),
 ('Third-Party Platforms and Services', [('p', 'Scholarise may use third-party platforms and services to deliver or support certain aspects of our programmes.'), ('p', 'These may include online classroom platforms, payment services, communication tools, learning platforms, hosting providers, and other technology services.'),
   ('p', 'Your use of such services may also be subject to the terms and privacy policies of those third parties.'), ('p', 'Scholarise is not responsible for policies or practices outside our reasonable control.')]),
 ('Website Use', [('p', 'You agree not to use the Scholarise website to:'),
   ('ul', ['Violate applicable laws', 'Attempt to gain unauthorised access to systems', 'Interfere with website security or functionality', 'Upload malicious software', 'Copy or misuse protected content', 'Misrepresent your identity', 'Use the website for fraudulent or harmful purposes']),
   ('p', 'We reserve the right to restrict access where we reasonably believe that website use violates these Terms or threatens the security of our services or users.')]),
 ('Refunds, Cancellations, and Transfers', [('p', 'Refund, cancellation, rescheduling, and programme-transfer arrangements may vary by course or package.'), ('p', 'The applicable policy will be communicated before or at the time of enrolment.'),
   ('p', 'Where a specific refund or cancellation policy applies to a programme, that policy will take precedence over general information on the website.')]),
 ('Service Interruptions', [('p', 'We will make reasonable efforts to provide our services as scheduled.'), ('p', 'However, classes or services may occasionally be affected by circumstances beyond our reasonable control, including:'),
   ('ul', ['Internet or technology failures', 'Power outages', 'Platform outages', 'Emergencies', 'Severe weather', 'Government restrictions', 'Other unforeseen circumstances']),
   ('p', 'Where reasonably possible, Scholarise will communicate significant interruptions and may provide an alternative arrangement where appropriate.')]),
 ('Limitation of Liability', [('p', 'Scholarise will take reasonable care in delivering its educational services.'),
   ('p', 'However, to the extent permitted by applicable law, Scholarise will not be responsible for losses arising from circumstances outside our reasonable control, including technical failures, third-party platform interruptions, inaccurate information provided by users, or failure to meet learning outcomes that cannot reasonably be guaranteed.'),
   ('p', 'Nothing in these Terms excludes or limits any liability that cannot legally be excluded or limited under applicable law.')]),
 ('Changes to These Terms', [('p', 'We may update these Terms from time to time to reflect changes in our services, business practices, technology, or legal requirements.'), ('p', 'When significant changes are made, we will update the “Last Updated” date and, where appropriate, provide additional notice.'),
   ('p', 'Continued use of our services after the updated Terms take effect constitutes acceptance of the revised Terms, subject to applicable law.')]),
 ('Contact Us', [('p', 'If you have questions about these Terms or any Scholarise programme, please contact us :'),
   ('raw', '<p><strong>Scholarise Academy</strong><br>Email : <a href="mailto:contact.scholariseacademy@gmail.com">contact.scholariseacademy@gmail.com</a><br>Facebook : <a href="https://www.facebook.com/scholariseacademy" target="_blank" rel="noopener">https://www.facebook.com/scholariseacademy</a><br>LinkedIn : <a href="https://www.linkedin.com/company/scholariseacademy" target="_blank" rel="noopener">https://www.linkedin.com/company/scholariseacademy</a></p>')]),
]
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')

def terms():
    P = '../'
    hero = page_hero(P, 'Terms &amp; Conditions', 'Scholarise Academy', 'Terms &amp; Conditions',
        ['Please read these Terms carefully before enrolling in a Scholarise programme.'])
    secs, toc = [], []
    for i, (h, blocks) in enumerate(TERMS, 1):
        inner = []
        for kind, val in blocks:
            if kind == 'p': inner.append('<p>%s</p>' % html.escape(val, quote=False))
            elif kind == 'ul': inner.append('<ul>%s</ul>' % ''.join('<li>%s</li>' % html.escape(x, quote=False) for x in val))
            else: inner.append(val)
        secs.append('<section class="legal-section" id="%s" data-reveal><h2><span>%02d</span>%s</h2>%s</section>' % (slug(h), i, html.escape(h), ''.join(inner)))
        toc.append('<li><a href="#%s">%s</a></li>' % (slug(h), html.escape(h)))
    body = hero + '''
<section class="section" style="padding-top:56px">
  <div class="container legal-layout">
    <aside class="toc" aria-label="On this page"><h2>On this page</h2><ol>%s</ol></aside>
    <div>
      <div class="legal-intro" data-reveal>
        <p>These Terms &amp; Conditions (“Terms”) govern your access to and use of the Scholarise Academy website, programmes, courses, learning materials, and related services.</p>
        <p>By accessing our website, enrolling in a programme, or using our services, you agree to these Terms. If you are enrolling a learner, you confirm that you are the learner’s parent or legal guardian, or otherwise have the appropriate authority to do so.</p>
      </div>
      %s
      <div class="legal-quote" data-reveal="zoom">
        <h2>Our Terms, Our Commitment</h2>
        <blockquote>“Clear expectations create better learning experiences.”</blockquote>
        <p>We want parents, guardians, learners, and our team to know what they can expect from one another—so that everyone can focus on what matters most: meaningful learning.</p>
        <p>Please read these Terms carefully before enrolling in a Scholarise programme.</p>
      </div>
    </div>
  </div>
</section>''' % (''.join(toc), '\n      '.join(secs))
    return page(P, 'terms', 'Terms & Conditions | Scholarise Academy', 'Terms and Conditions for Scholarise Academy programmes and website.', body)

# =========================================================
# BLOGS / PRIVACY (content not supplied yet)
# =========================================================
SOON_ART = '''<svg viewBox="0 0 200 160" aria-hidden="true"><circle cx="100" cy="84" r="70" fill="#d6f2e0"/>
<rect x="56" y="40" width="88" height="104" rx="12" fill="#fff" stroke="#035643" stroke-width="4"/>
<path d="M72 66h56M72 84h56M72 102h36" stroke="#349C5C" stroke-width="4" stroke-linecap="round"/>
<circle class="float" cx="150" cy="44" r="16" fill="#F8BD25"/><path d="M150 36v9l6 4" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/></svg>'''
def soon(page_id, crumb, title):
    P = '../'
    body = page_hero(P, crumb, 'Scholarise Academy', title, []) + '''
<section class="section">
  <div class="container soon" data-reveal="zoom">
    %s
    <p>This page is coming soon.</p>
    <a class="btn btn-primary" href="../">Back to Home %s</a>
  </div>
</section>''' % (SOON_ART, I['arrow'])
    return page(P, page_id, '%s | Scholarise Academy' % title, '%s – Scholarise Academy' % title, body)

# =========================================================
# WRITE
# =========================================================
if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT + '/assets/images'); os.makedirs(OUT + '/assets/fonts')
shutil.copytree('/home/claude/build/assets/css', OUT + '/assets/css')
shutil.copytree('/home/claude/build/assets/js', OUT + '/assets/js')
for f in os.listdir('/home/claude/site/assets/images'):
    shutil.copy('/home/claude/site/assets/images/' + f, OUT + '/assets/images/')
for f in os.listdir('/home/claude/site/assets/fonts'):
    if f.startswith(('poppins', 'montserrat')):
        shutil.copy('/home/claude/site/assets/fonts/' + f, OUT + '/assets/fonts/')
pages = {'index.html': home(), 'aboutus/index.html': about(), 'contactus/index.html': contact(),
         'terms&condition/index.html': terms(), 'blogs/index.html': soon('blogs', 'Blogs', 'Blogs'),
         'privacypolicy/index.html': soon('privacy', 'Privacy Policy', 'Privacy Policy')}
for path, content in pages.items():
    full = os.path.join(OUT, path); os.makedirs(os.path.dirname(full), exist_ok=True)
    # asset paths inside reused artwork are root-relative to the old page
    if path != 'index.html':
        content = content.replace('src="assets/', 'src="../assets/')
    open(full, 'w', encoding='utf-8').write(content)
print('built', list(pages))
