// Dummy chat conversations per channel Shared Inbox, grouped by view
// (Unassigned / Assigned to Bot / Mine / All Assigned / Closed). Each view has
// a few conversations; the sidebar shows the per-view count and the inbox total.

export const CHANNEL_BY_INBOX = {};

// Slack #channel chip per inbox.
const SLACK_CHANNEL = {
  'Slack 01': 'support',
  'Slack 02': 'shipping',
};

const NAMES = [
  'Priya Nair', 'Marcus Lee', 'Sofia Reyes', 'Daniel Kim', 'Grace Okafor',
  'Tom Becker', 'Hana Sato', 'Liam Walsh', 'Ava Patel', 'Noah Khan',
  'Arlene McCoy', 'Guy Hawkins', 'Courtney Henry', 'Darlene Robertson', 'Eleanor Pena',
  'Floyd Miles', 'Jerome Bell', 'Devon Lane', 'Kathryn Murphy', 'Jacob Jones',
  'Kristin Watson', 'Cody Fisher', 'Jane Cooper', 'Wade Warren', 'Esther Howard',
  'Leslie Alexander', 'Jenny Wilson', 'Robert Fox', 'Albert Flores', 'Bessie Cooper',
  'Ralph Edwards', 'Cameron Williamson', 'Brooklyn Simmons', 'Theresa Webb', 'Marvin McKinney',
  'Savannah Nguyen', 'Annette Black', 'Ronald Richards', 'Dianne Russell', 'Ralph Johnson',
];
const COLORS = ['#7b8bd4', '#d96d71', '#caaed1', '#98d2c5', '#e0b83a', '#8b7fd4', '#f19192'];
const PREVIEWS = [
  'Is the pro plan available monthly?',
  'The chat widget is not loading on mobile',
  'Can we get a demo for our team next week?',
  'Interested in upgrading to the enterprise tier',
  'Need help with account setup',
  'My order has been delayed, can you check?',
  'Following up on my previous ticket',
  'Thanks for the quick help earlier!',
  'How do I reset my password?',
  'Please rate the chat',
];
const DATES = ['Jul 23', 'Jul 22', 'Jul 21', 'Jul 20', 'Jul 19'];

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

let globalNameIdx = 0;

const makeConvos = (inbox, channel, view, count) =>
  Array.from({ length: count }, (_, i) => {
    const idx = globalNameIdx++;
    const name = NAMES[idx % NAMES.length];
    const preview = PREVIEWS[idx % PREVIEWS.length];
    const color = COLORS[idx % COLORS.length];
    const date = DATES[idx % DATES.length];
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const phone = `+1 (555) 01${(10 + (idx % 90)).toString().padStart(2, '0')}`;
    return {
      id: `${slug(inbox)}-${slug(view)}-${i}`,
      view,
      name,
      email,
      phone,
      title: name,
      avatarInitial: name.charAt(0),
      avatarColor: color,
      channel: SLACK_CHANNEL[inbox] || 'support',
      date,
      preview,
      messages: [
        { kind: 'incoming', text: preview, time: `${date}, 10:0${i + 1} AM` },
        { kind: 'agent-text', text: 'Sure, happy to help with that!', time: `${date}, 10:0${i + 2} AM`, sender: 'Arnold' },
      ],
    };
  });

const buildInbox = (inbox, channel) => {
  const views = channel === 'chat'
    ? [['Unassigned', 3], ['Assigned to Bot', 2], ['Mine', 3], ['All Assigned', 2], ['Closed', 2]]
    : [['Unassigned', 3], ['Mine', 3], ['All Assigned', 2], ['Closed', 2]];
  let out = [];
  views.forEach(([view, count]) => {
    out = out.concat(makeConvos(inbox, channel, view, count));
  });
  return out;
};

export const CHANNEL_CHATS = Object.fromEntries(
  Object.entries(CHANNEL_BY_INBOX).map(([inbox, channel]) => [inbox, buildInbox(inbox, channel)])
);

// Keep the WhatsApp 24-hour template demo on one conversation.
if (CHANNEL_CHATS['WhatsApp 01']?.[0]) CHANNEL_CHATS['WhatsApp 01'][0].blocked = true;

// Views that carry a conversation count in the sidebar.
const COUNTED_VIEWS = new Set(['Unassigned', 'Assigned to Bot', 'Mine', 'All Assigned', 'Closed']);
export const isCountedView = (view) => COUNTED_VIEWS.has(view);
export const channelViewCount = (inbox, view) =>
  (CHANNEL_CHATS[inbox] || []).filter((c) => c.view === view).length;
export const channelInboxTotal = (inbox) => (CHANNEL_CHATS[inbox] || []).length;
