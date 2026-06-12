/* Static data — platforms, genres, blog posts, fallback digital codes.
   Products now come from Supabase (see src/supabase.js). */

import ps5Img from './assets/devices/vecteezy_ps5-console-logo_29337384.webp';
import ps4Img from './assets/devices/vecteezy_playstation-ps5-ps4-logo-free-vector_20336136-Converted.webp';
import switch2Img from './assets/devices/Nintendo_Switch_2_logo.svg.webp';
import switchImg from './assets/devices/Nintendo_Switch_logo_square.webp';

// Fallback digital codes (real ones come from Supabase)
export const digital = [
  { id: 100, title: 'PlayStation Plus', tier: '12-Month Membership', price: 2400, accent: '#0070d1', kind: 'Subscription' },
  { id: 101, title: 'PSN Wallet Card', tier: 'EGP 1,000 Top-Up', price: 1050, accent: '#0070d1', kind: 'Wallet' },
  { id: 102, title: 'Nintendo eShop Card', tier: 'EGP 750 Credit', price: 780, accent: '#e60012', kind: 'Wallet' },
  { id: 103, title: 'Nintendo Switch Online', tier: '12-Month + Expansion', price: 1850, accent: '#e60012', kind: 'Subscription' },
  { id: 104, title: 'Xbox Game Pass Ultimate', tier: '3-Month Code', price: 1490, accent: '#107c10', kind: 'Subscription' },
  { id: 105, title: 'Steam Wallet Code', tier: 'EGP 500 Credit', price: 540, accent: '#1b2838', kind: 'Wallet' },
];

export const platforms = [
  { key: 'PS5',      name: 'PlayStation 5',      count: 86,  hue: 230, img: ps5Img     },
  { key: 'PS4',      name: 'PlayStation 4',       count: 142, hue: 220, img: ps4Img     },
  { key: 'Switch 2', name: 'Nintendo Switch 2',   count: 38,  hue: 6,   img: switch2Img },
  { key: 'Switch',   name: 'Nintendo Switch',     count: 210, hue: 350, img: switchImg  },
];

export const genres = [
  'Action', 'Adventure', 'RPG', 'Shooter', 'Racing',
  'Sports', 'Horror', 'Casual', 'Fighting', 'Strategy', 'Indie',
];

export const posts = [
  {
    id: 1, cat: 'News',
    slug: 'ea-sports-fc-26-manager-career-everything-new',
    title: 'EA SPORTS FC 26 — everything new in Manager Career',
    date: 'Jun 2, 2025', read: '5 min', hue: 95,
    author: 'Karim Hassan',
    excerpt: 'Live training, dynamic press conferences, agent negotiations — Manager Career gets its biggest shake-up in years.',
    body: `<p>EA SPORTS has spent the last two cycles tightening the on-pitch experience. With <strong>FC 26</strong>, the studio finally turns its attention to the mode that millions return to season after season: <em>Manager Career</em>.</p>
<h2>Live training, live consequences</h2>
<p>Training drills no longer happen in a sterile menu. You now run sessions directly on your pitch, watch attribute deltas land in real time, and decide which youth-academy prospect gets the spotlight on matchday. Coaches with the right specialisation unlock new drill packs as their rapport with you grows.</p>
<h2>Agent negotiations that actually negotiate</h2>
<p>The transfer window has been completely rewritten. Agents now bring their own personality — some bluff, some leak to the press, others push for image rights and signing bonuses on top of base wages. You'll hate them. You'll need them.</p>
<h2>Press conferences with weight</h2>
<p>Answers feed directly into squad morale and board confidence. Dodge a tough question after a derby loss and watch your captain's body language change at the next session.</p>
<p>FC 26 launches globally on <strong>September 26</strong>. Pre-orders open at the Crazy Game store from June 10.</p>`,
  },
  {
    id: 2, cat: 'Guides',
    slug: 'switch-2-launch-lineup-what-to-pre-order-first',
    title: 'Switch 2 launch line-up: what to pre-order first',
    date: 'May 28, 2025', read: '7 min', hue: 6,
    author: 'Salma Adel',
    excerpt: 'Mario Kart World, Donkey Kong Bananza, Hyrule Warriors — sorting the day-one essentials from the wait-for-sale.',
    body: `<p>Switch 2 is here, and Nintendo's first-party slate is louder than any console launch since the original Switch in 2017. Here's how to spend your day-one budget.</p>
<h2>Day-one essentials</h2>
<ul>
<li><strong>Mario Kart World</strong> — every classic track + a brand-new open-world racing campaign. The bundle SKU pays for itself.</li>
<li><strong>Donkey Kong Bananza</strong> — DK's first solo platformer since Tropical Freeze, built around terrain you can punch into rubble. Slick 60fps performance mode.</li>
</ul>
<h2>Worth waiting on</h2>
<ul>
<li><strong>Hyrule Warriors: Age of Imprisonment</strong> — fantastic if you loved Age of Calamity, skippable otherwise.</li>
<li><strong>Switch 1 enhanced re-releases</strong> — most will drop to half price within 90 days.</li>
</ul>
<p>Reserve your Switch 2 console through Crazy Game to lock in the early-adopter accessory bundle (carry case + 256 GB microSD Express + screen protector).</p>`,
  },
  {
    id: 3, cat: 'Deals',
    slug: 'mid-season-sale-ps5-titles-under-egp-1500',
    title: 'Mid-season sale: 40+ PS5 titles under EGP 1,500',
    date: 'May 20, 2025', read: '3 min', hue: 230,
    author: 'Crazy Game Editorial',
    excerpt: 'From Final Fantasy XVI to Hogwarts Legacy — our hand-picked PS5 discounts running through the end of the month.',
    body: `<p>The mid-season sale is live across our PS5 catalogue and there are real bangers in here for under <strong>EGP 1,500</strong>. We've cherry-picked the highlights:</p>
<h2>Story bangers</h2>
<ul>
<li>Final Fantasy XVI — EGP 1,299</li>
<li>Hogwarts Legacy — EGP 1,450</li>
<li>God of War Ragnarök — EGP 1,099</li>
</ul>
<h2>Multiplayer & co-op</h2>
<ul>
<li>It Takes Two — EGP 799</li>
<li>EA SPORTS FC 25 — EGP 999</li>
</ul>
<p>Stock is genuinely limited on the headliners. Sale ends May 31 at midnight.</p>`,
  },
  {
    id: 4, cat: 'Reviews',
    slug: 'black-myth-wukong-action-design-masterclass',
    title: 'Black Myth: Wukong — a masterclass in action design',
    date: 'May 14, 2025', read: '9 min', hue: 280,
    author: 'Omar El Sayed',
    excerpt: 'After 40 hours with the Monkey King, here\'s why Game Science\'s debut feels like a generational moment for soulslikes.',
    body: `<p>I went into <strong>Black Myth: Wukong</strong> expecting another Souls-like with a fresh coat of paint. What I got instead was a 40-hour deconstruction of every assumption the genre has made since Demon's Souls.</p>
<h2>Combat that respects your time</h2>
<p>The three stances — pillar, smash, and thrust — aren't just damage profiles. Each unlocks a parallel skill tree, and stance-swap timing becomes a third layer of mechanical depth on top of attack and dodge. The Monkey King's transformations slot into this system without ever feeling like cutscenes interrupting play.</p>
<h2>Bosses that earn their place</h2>
<p>I died to the Yellow Wind Sage 27 times. I'd do it again. There isn't a single throwaway boss in the campaign — every encounter introduces a mechanic that recurs later, deepened. The pacing of new ideas is among the best in the genre.</p>
<h2>The verdict</h2>
<p>Black Myth: Wukong is a generational moment for action design. Not since Sekiro have I felt this level of mechanical conviction. If you have a PS5, this is non-negotiable.</p>
<p><strong>Score: 9.5 / 10</strong></p>`,
  },
];
