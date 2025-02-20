# Fossify Notes export to text

Simple [React Native] Android (10+) app to convert [Fossify Notes] full-export JSON data
with all stored notes (available via Settings menu) to plaintext for share/copy buttons.

There should be an APK under "Releases", and see below for how to build it yourself.

JSON can be shared from some other app (e.g. File Manager),
loaded via "Load File" button, or copy-pasted into main textbox,
after which "Copy" and "Share" button will be able to export converted
plaintext version of that.

At the moment, only "all notes" export for Fossify Notes seem to be in
machine-friendly JSON format, and I was asked to make it easier to share all
notes from there to other apps, hence this quick tool that converts such
serialization like this (normally ugly/compressed, prettified for this README):

``` json
[
  {
    "id": 123,
    "title": "On Stonehenge, at alt.fan.pratchett (8 June 1997)",
    "value": "I don't like the place at all.\nIt's all wrong. An imposition on the Landscape.\nI reckon that Stonehenge was build by the contemporary equivalent of Microsoft,\nwhereas Avebury was definitely an Apple circle.",
    "type": "TYPE_TEXT",
    "path": "",
    "protectionType": -1,
    "protectionHash": ""
  },
  {
    "id": 176,
    "title": "Another random note title!!1111",
    "value": "I believe you find life such a problem because you think there are good people and bad people.\nYou're wrong, of course. There are, always and only, the bad people, but some of them are on opposite sides.",
    "type": "TYPE_TEXT",
    "path": "",
    "protectionType": -1,
    "protectionHash": ""
  },
...
```

To plaintext with headers and newlines, how they are in the Notes app:

```
--- On Stonehenge, at alt.fan.pratchett (8 June 1997)
I don't like the place at all.
It's all wrong. An imposition on the Landscape.
I reckon that Stonehenge was build by the contemporary equivalent of Microsoft,
whereas Avebury was definitely an Apple circle.

--- Another random note title!!1111
I believe you find life such a problem because you think there are good people and bad people.
You're wrong, of course. There are, always and only, the bad people, but some of them are on opposite sides.
```

Copy/Share buttons auto-convert any shared/loaded/pasted json into such text.

[React Native]: https://reactnative.dev/
[Fossify Notes]: https://github.com/FossifyOrg/Notes

Alternative URLs for this repository:

- <https://github.com/mk-fg/fossify-notes-export-to-text>
- <https://codeberg.org/mk-fg/fossify-notes-export-to-text>


## How to build/install apk for an Android device

Should be not too difficult on a typical Linux system or VM.

- Install/setup [Android Studio], which will bring working SDK and JDK with it.

    Check under "File -> Other Settings -> Default Project Structure -> JDK path"
    there for where JDK is installed, and export paths to it and Android/Sdk into
    environment for all react-native tools.

    ``` sh
    export ANDROID_HOME=/home/adev/Android/Sdk
    export PATH="$PATH:$ANDROID_HOME/tools/bin/"
    export PATH="$PATH:$ANDROID_HOME/platform-tools/"
    export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"
    export PATH="$PATH:$ANDROID_HOME/emulator"
    export JAVA_HOME=/opt/android-studio/jbr
    export PS1=" #aenv$PS1"
    ```

- Install [npm] and run: `npx @react-native-community/cli init FossifyNotesToText`

    This will setup "FossifyNotesToText" dir with a fresh [React Native] project.

- Copy project files from this repo into FossifyNotesToText:

    ``` sh
    dst=../FossifyNotesToText
    cp App.tsx package.json react-native.config.js $dst/
    cp AndroidManifest.debug.xml $dst/android/app/src/debug/AndroidManifest.xml
    cp AndroidManifest.main.xml $dst/android/app/src/main/AndroidManifest.xml
    ```

- Run `npm install` to get all JS dependencies, `npm run link` to register assets,
  and then `cd android && ./gradlew assembleRelease` to build
  `app/build/outputs/apk/release/app-release.apk` android application package file.

  That's it, copy/install that `app-release.apk` via usual side-loading.

- Optionally, when tweaking code in the app, it should also be easy to debug-run it
  with live code reloading via one of the emulated devices installed in Android Studio,
  for example:

  ``` console
  % emulator -list-avds
  ## ...list of devices Studio downloaded into SDK dirs

  % emulator -avd Nexus_One_API_30
  ## Will start VM for device with X11/wayland window and debug UIs on the side

  % adb devices -l && adb get-state
  ## Should confirm that device is "connected" and available to debug tools
  ```

  Then `adb install android/app/build/outputs/apk/release/app-release.apk`
  can be used to install/test release apk built in an earlier step.

  Or run `npm run start` instead, then `npm run android` to build live-updating
  debug version and start it on adb-connected phone/VM, which will reload
  changed app code immediately on-the-fly and pretty-print any errors there.
  Except when changing dependencies in `package.json` - run `npm i` to also fetch those.

App code is in [App.tsx] file, and [package.json] lists all dependencies.
Should run on Android 10 and later devices.

[Android Studio]: https://developer.android.com/studio
[npm]: https://www.npmjs.com/
[App.tsx]: App.tsx
[package.json]: package.json
