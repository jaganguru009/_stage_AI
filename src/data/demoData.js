export const navigation = [
  ['dashboard', 'Overview', 'OV'],
  ['feed', 'Community', 'CM'],
  ['search', 'Discover talent', 'DS'],
  ['castings', 'Casting calls', 'CC'],
  ['applications', 'Applications', 'AP'],
  ['messages', 'Messages', 'MS'],
  ['notifications', 'Notifications', 'NT'],
  ['settings', 'Settings', 'ST'],
]

export const artist = { name: 'Maya D Souza', initials: 'MD', role: 'Actor and movement artist', location: 'Pune, India', completedCredits: 18, followers: '1.2k', following: 186, availability: 'Available from September' }

export const artistDisciplines = [
  { group: 'Performance', items: ['Actor', 'Singer / vocalist', 'Musician / instrumentalist', 'Dancer / movement artist', 'Voice artist', 'Puppeteer'] },
  { group: 'Creative', items: ['Writer / playwright', 'Director', 'Assistant director', 'Choreographer', 'Composer / musical director', 'Dramaturg'] },
  { group: 'Design and backstage', items: ['Stage manager', 'Production manager', 'Lighting designer', 'Sound designer', 'Set designer', 'Costume designer', 'Makeup and hair artist', 'Props designer'] },
  { group: 'Technical', items: ['Light operator', 'Sound operator', 'Technical director', 'Scenic artist', 'AV / projection designer', 'Rigging and fly crew'] },
]

export const artists = [
  { name: 'Aarav Kulkarni', initials: 'AK', craft: 'Theatre actor', area: 'Kothrud, Pune', credits: 14, languages: 'Marathi, Hindi, English', color: 'violet' },
  { name: 'Rhea Deshpande', initials: 'RD', craft: 'Singer and actor', area: 'Viman Nagar, Pune', credits: 9, languages: 'Marathi, Hindi', color: 'teal' },
  { name: 'Ishaan Shah', initials: 'IS', craft: 'Lighting designer', area: 'Shivajinagar, Pune', credits: 22, languages: 'Hindi, English', color: 'orange' },
]

export const dashboard = {
  greeting: 'Good morning, Maya.',
  summary: 'Three opportunities are looking for your kind of work this week.',
  auditions: [
    { day: '14', month: 'AUG', title: 'The Last Monsoon', company: 'Rangmanch Pune', time: '10:30 AM', tag: 'In person' },
    { day: '18', month: 'AUG', title: 'Cities of Dust', company: 'Awaaz Collective', time: '2:00 PM', tag: 'Self tape' },
  ],
  opportunities: [
    { id: 'glass-menagerie', title: 'Lead actor - The Glass Menagerie', company: 'Rangmanch Pune', meta: 'Pune  |  Theatre run', tone: 'violet' },
    { id: 'ensemble', title: 'Ensemble performer', company: 'Ninaad Arts', meta: 'Pune  |  Contract', tone: 'teal' },
    { id: 'movement', title: 'Movement artist for new work', company: 'Awaaz Collective', meta: 'Pune  |  Flexible', tone: 'orange' },
  ],
}

export const feedPosts = [
  { id: 1, author: 'Rhea Deshpande', initials: 'RD', role: 'Singer and actor', time: '2h', text: 'Finding my voice again in the rehearsal room. Small fragments from a new Marathi musical.', tags: ['rehearsal', 'marathi-theatre'], likes: 84, comments: 12, color: 'teal' },
  { id: 2, author: 'Rangmanch Pune', initials: 'RP', role: 'Theatre group', time: '5h', text: 'We are opening auditions for The Last Monsoon. We are looking for performers with a strong movement practice.', tags: ['casting-call', 'pune'], likes: 126, comments: 25, color: 'violet' },
]

export const conversations = [
  { id: 1, name: 'Rangmanch Pune', initials: 'RP', last: 'Would Thursday work for the reading?', time: '10:42', unread: 2, color: 'violet' },
  { id: 2, name: 'Aarav Kulkarni', initials: 'AK', last: 'The workshop was beautiful.', time: 'Yesterday', unread: 0, color: 'orange' },
  { id: 3, name: 'Awaaz Collective', initials: 'AC', last: 'Thanks for sharing your reel.', time: 'Mon', unread: 0, color: 'teal' },
]

export const notifications = [
  ['Rangmanch Pune viewed your profile', '12 minutes ago', 'profile'],
  ['Your application to The Last Monsoon was shortlisted', '1 hour ago', 'application'],
  ['Rhea Deshpande applauded your rehearsal post', '3 hours ago', 'social'],
  ['A new casting call matches your availability', 'Yesterday', 'casting'],
]
