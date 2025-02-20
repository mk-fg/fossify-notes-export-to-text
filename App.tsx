import {useState, useEffect, useCallback} from 'react'
import {Share, ToastAndroid, Appearance} from 'react-native'
import styled from 'styled-components/native'
import Icon from 'react-native-vector-icons/Ionicons'
import Clipboard from '@react-native-clipboard/clipboard'
import {pick, types, isErrorWithCode, errorCodes} from '@react-native-documents/picker'
import {FileSystem} from 'react-native-file-access'
import ShareMenu from 'react-native-share-menu'


const WAppView = styled.View`
  flex-direction: column;
  flex-grow: 1;
  padding-horizontal: 10px;
  padding-vertical: 10px;`

const WBtnRow = styled.View`
  padding: 10px;
  flex-direction: row;
  flex-wrap: wrap-reverse;
  justify-content: space-between;`

const WBtnBox = styled.TouchableOpacity`
  elevation: 8;
  flex-direction: row;
  border-radius: 10px;
  margin-horizontal: 5px;
  margin-vertical: 5px;
  padding-vertical: 10px;
  padding-horizontal: 12px;
  background-color: #333;`

const WBtnIcon = styled(Icon)`
  color: #fff;
  margin-right: 5;
  fontSize: 18;`

const WBtnText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  align-self: center;`

const WInput = styled.TextInput`
  flex: 1;
  color: ${Appearance.getColorScheme() === 'dark' ? '#fff' : '#000'}
  selectTextOnFocus: true;
  textAlignVertical: top;
  padding: 5px;
  border: 1px #ddd solid;
  placeholder-text-color: #999;`

const WBtn = ({icon, title, cb}) => (
  <WBtnBox>
    <WBtnIcon name={icon} />
    <WBtnText onPress={cb}>{title}</WBtnText>
  </WBtnBox> )


const App = () => {
  const [json, json_set] = useState('')

  const handle_shared = useCallback(async item => {
    if (!(item && item.data)) return
    try {
      const data = await FileSystem.readFile(item.data)
      JSON.parse(data)
      json_set(data)
    } catch (err) { run_alert(`Failed to load data:\n${err.message || err}`) } }, [])
  useEffect(() => ShareMenu.getInitialShare(handle_shared), [])
  useEffect(() => {
    const listener = ShareMenu.addNewShareListener(handle_shared)
    return () => listener.remove() }, [])

  const json_get_text = () => {
    try {
      let notes = JSON.parse(json)
      if (!Array.isArray(notes)) throw Error('Unrecognized export-data structure')
      // notes.sort((a, b) => (a.id+1 || 9999) - (b.id+1 || 9999))
      return notes.map(n => [
        n.title ? `-- ${n.title}` : null,
        n.value ].filter(d => d).join('\n')).join('\n\n')
    } catch (err) { run_alert(`Failed to parse JSON data:\n${err.message || err}`) } }

  // const run_alert = msg => alert(msg)
  const run_alert = msg =>
    ToastAndroid.showWithGravity(msg, ToastAndroid.LONG, ToastAndroid.TOP)

  const run_share = async () => {
    const text = json_get_text(); if (!text) return
    try {
      const res = await Share.share({message: text})
      if (res.action === Share.dismissedAction) run_alert('Sharing cancelled')
    } catch (err) { run_alert(`Sharing error:\n${err.message || err}`) } }

  const run_copy = () => {
    const text = json_get_text(); if (!text) return
    Clipboard.setString(text)
    const [n_chars, n_words, n_lines] =
      [text.length, text.trim().split(/\s+/).length, text.split('\n').length]
        .map(n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
    run_alert( `Copied as text\n[ ${n_lines}`+
      ` line(s), ${n_words} words, ${n_chars} chars ]` ) }

  const run_file_load = async () => {
    try {
      const [res] = await pick({mode: 'open'})
      if (!res.name) throw Error('Nothing was picked')
      if (res.size && res.size > 1048576)
        throw Error('File is too large (maybe a misclick?)')
      const data = await FileSystem.readFile(res.uri)
      try { JSON.parse(data) } catch (err) {
        throw Error('Unrecognized file contents (not JSON export)') }
      json_set(data)

    } catch (err) {
      if (!isErrorWithCode(err))
        return run_alert(`Failed to load file:\n${err.message || err}`)
      switch (err.code) {
        case errorCodes.IN_PROGRESS: return run_alert('File picker already open somewhere')
        case errorCodes.UNABLE_TO_OPEN_FILE_TYPE: return run_alert('Invalid file type')
        case errorCodes.OPERATION_CANCELED: return run_alert('File load cancelled')
        default: return run_alert(`Failed to pick/load file:\n${err.message || err}`) } } }

  return (
    <WAppView>
    <WBtnRow>
      <WBtn icon='copy-outline' title='Copy' cb={run_copy} />
      <WBtn icon='share-social-outline' title='Share' cb={run_share} />
      <WBtn icon='push-outline' title='Load File' cb={run_file_load} />
    </WBtnRow>
    <WInput
      multiline
      // autoFocus
      placeholder='Copy/paste JSON here'
      onChangeText={text => json_set(text)}
      value={json} />
    </WAppView> )
}

export default App
