export const navigation = [
  ['dashboard', 'Overview', 'dashboard'],
  ['feed', 'Community', 'feed'],
  ['castings', 'Casting calls', 'castings'],
  ['applications', 'Applications', 'applications'],
  ['messages', 'Messages', 'messages'],
  ['notifications', 'Notifications', 'notifications'],
  ['settings', 'Settings', 'settings'],
]

export const organizationNavigation = [
  ['organization', 'Overview', 'dashboard'],
  ['search', 'Discover talent', 'search'],
  ['castings', 'Manage castings', 'castings'],
  ['messages', 'Messages', 'messages'],
  ['notifications', 'Notifications', 'notifications'],
  ['settings', 'Settings', 'settings'],
]

export const artist = { name: 'Maya D Souza', initials: 'MD', role: 'Actor and movement artist', location: 'Pune, India', completedCredits: 18, followers: '1.2k', following: 186, availability: 'Available from September' }

export const demoUsers = [
  { role: 'artist', name: 'Maya D Souza', email: 'maya@stage.demo', password: 'Stage@2026', account: 'Artist', initials: 'MD', avatarTone: 'sunset' },
  { role: 'casting', name: 'Kabir Mehta', email: 'kabir@stage.demo', password: 'Stage@2026', account: 'Casting director', initials: 'KM', avatarTone: 'ink' },
  { role: 'organization', name: 'Rangmanch Pune', email: 'rangmanch@stage.demo', password: 'Stage@2026', account: 'Theatre group', initials: 'RP', avatarTone: 'plum' },
  { role: 'agency', name: 'Aakar Talent House', email: 'aakar@stage.demo', password: 'Stage@2026', account: 'Talent agency', initials: 'AT', avatarTone: 'ochre' },
]

export const initialArtistProfile = {
  ...artist,
  bio: 'I make work that begins in the body. Currently collaborating across Marathi, Hindi, and English theatre.',
  photo: '',
  portfolio: [
    { id: 'room', title: 'A Room of Her Own', year: '2025', company: 'Independent production', role: 'Performer / devised ensemble', description: 'A quiet, physical study of memory, rooms, and the selves we leave behind.', type: 'image', src: '' },
    { id: 'monsoon', title: 'The Last Monsoon', year: '2024', company: 'Rangmanch Pune', role: 'Lead performer', description: 'An original Marathi work about a city listening for the rain.', type: 'image', src: '' },
    { id: 'transit', title: 'Bodies in Transit', year: '2024', company: 'Independent production', role: 'Movement collaborator', description: 'An ensemble piece shaped through gesture, rhythm, and public space.', type: 'image', src: '' },
  ],
}

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

export const communitySeeds = [
  { id: 'pune-makers', name: 'Pune Theatre Makers', description: 'The open room for actors, directors, designers, and backstage artists building Pune theatre.', members: '2,480', tone: 'maroon', joined: true },
  { id: 'marathi-new-work', name: 'Marathi New Work Circle', description: 'Readings, scripts, music, and early conversations around original Marathi theatre.', members: '684', tone: 'saffron', joined: false },
  { id: 'stagecraft-pune', name: 'Stagecraft Pune', description: 'A working circle for lights, sound, set, costume, production, and technical craft.', members: '421', tone: 'teal', joined: false },
  { id: 'theatre-musicians', name: 'Theatre Musicians Collective', description: 'For composers, singers, instrumentalists, and sound artists making work for the stage.', members: '318', tone: 'plum', joined: true },
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
