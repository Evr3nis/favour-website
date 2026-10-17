# FAVOUR MEDIA — Publishing Guide

This is the video + audio section of the FAVOUR.exe website.

Public address: https://evr3nis.github.io/favour-website/media/

## What's included

- \`index.html\`: the video/audio channel page
- \`media.css\`: retro video-platform-style design
- \`media.js\`: native player, video/audio filters, search, sorting, playlists/queue, sharable links, captions, transcripts, and local previews
- \`catalog.js\`: a list of **published** recordings (empty until you add your own)
- \`recordings/\` (create later): your published MP4, MP3, M4A, or other browser-supported media files

You do not need to edit \`media.js\` or \`index.html\` to add a recording. Only add the recording file and an entry to \`catalog.js\`.

## First: Try a recording without publishing

1. Open https://evr3nis.github.io/favour-website/media/ in Safari.
2. Scroll to **LOCAL_PREVIEW.EXE**.
3. Tap **CHOOSE VIDEO OR AUDIO** and select a video or sound file.
4. The preview will play using your browser's own player. It **does not upload to the internet**, your GitHub repository, or the site.
5. Use **REMOVE PREVIEW** to remove it or refresh the page.

The browser may not support every file format, even if the Files picker accepts it.

## Publish your first video or audio recording

**Privacy:** This repository and its GitHub Pages site are public. Files committed to it can be downloaded by anyone, even if you later delete them. Do not publish school locations, addresses, telephone numbers, private conversations, or recordings of other people without appropriate permission.

1. Make a recording in a browser-friendly format, such as MP4 (H.264 video with AAC audio) or MP3/M4A audio.
2. On GitHub, open https://github.com/Evr3nis/favour-website
3. Create a folder named \`media/recordings\` if needed and upload your file there. GitHub's web upload interface has a file-size limit; a small compressed recording is best to start. Large recordings are usually better hosted on a separate video/audio provider.
4. Edit \`media/catalog.js\` in GitHub and add an item to the \`window.FAVOUR_RECORDINGS\` array. For example:

\`\`\`js
window.FAVOUR_RECORDINGS = [
  {
    id: "first-introduction",
    type: "video",
    title: "My First Introduction",
    category: "Personal Updates",
    description: "A short introduction to FAVOUR MEDIA.",
    date: "2026-10-17",
    src: "recordings/first-introduction.mp4",
    poster: "",
    captions: "",
    duration: "02:10",
    transcript: ""
  },
  {
    id: "audio-reflection-01",
    type: "audio",
    title: "An Audio Reflection",
    category: "Audio Journal",
    description: "A short recording about an idea.",
    date: "2026-10-17",
    src: "recordings/audio-reflection-01.mp3",
    poster: "",
    duration: "04:20",
    transcript: ""
  }
];
\`\`\`

**This is an example only.** Change titles, dates, filenames, lengths, and descriptions to match your real files. Do not paste examples into the live catalog until files exist.

5. Tap **Commit changes** and wait for GitHub Pages to deploy the new version.
6. Refresh your Media page. The recordings will appear as cards and in the Watch & Listen queue.

### Required fields

- \`id\`: unique lowercase letters, numbers and hyphens, at least 2 characters (for shareable links).
- \`type\`: \`"video"\` or \`"audio"\`.
- \`title\`: what visitors should see.
- \`src\`: browser-playable file path relative to the \`media/\` directory, or a **direct** HTTPS media file URL (not an ordinary YouTube watch URL).

The \`category\`, \`description\`, \`date\`, \`duration\`, \`poster\`, \`captions\`, and \`transcript\` fields are optional but recommended.

### Captions and transcripts

For a video, you can provide a WebVTT subtitle file such as \`captions/episode-01.vtt\` in the \`captions\` field. Use the \`transcript\` field for a text transcript that visitors can read. These features make content easier to follow without sound and improve accessibility.

### Editing and sharing recordings

On the published page, select a recording and tap **COPY EPISODE LINK**. This creates a link like:

\`https://evr3nis.github.io/favour-website/media/#watch-first-introduction\`

Change the entry's title and description in \`catalog.js\` to update details. Replace the media file in your repository to update the recording itself. Commit changes and wait for GitHub Pages to update.

## What this does not do

FAVOUR MEDIA is a static GitHub Pages site, not a complete video-hosting platform. It does **not** provide accounts, real video uploads from visitors, livestreaming, recommendations, comments, automatic transcoding, analytics, or storage for local previews. Playback depends on each browser's support for the source format.

For large recordings, use a video/audio host and optionally link to it or host direct playable media files elsewhere with proper HTTPS and cross-origin access settings.

The media hub is your own original interface inspired by video-library layouts, not an official YouTube, LibreTube, Rumble, or Odysee product.
