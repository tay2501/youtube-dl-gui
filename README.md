# youtube-dl-gui
youtube-dl-gui is GUI for youtube-dl.
It is made by electron, so that it is cross-platform desktop app.

# Overview
The purpose of this app is to help you download youtube videos easily.

You can download videos by the following steps.

1. Install Docker Desktop. [https://www.docker.com/get-started](https://www.docker.com/get-started)
2. Open youtube-dl-gui.
3. Click the setting button and set download directory.
4. Enter URL.
5. Click download button.

# Description
It is possible to download YouTube videos to use youtube-dl.
But, in order to download a high quality videos, you need to do more preparation steps like installing Python, FFmpeg.

youtube-dl-gui will save you time in preparation and allow you to download high quality videos quickly.

youtube-dl-gui uses youtube-dl Docker image like [uchikoma/youtube-dl:1.0](https://hub.docker.com/r/uchikoma/youtube-dl). You can change Docker image at setting if necessary.

## Docker image
The Docker image needs to contains youtube_dl, aria2 and ffmpeg.

# Requirements
+ Docker Desktop
+ youtube-dl Docker image

# Development environment
+ Node.js v15.0.1
+ Node packages [^1]
    + electron: ^13.1.7
    + electron-builder: ^22.9.1

[^1]: See package.json for details.