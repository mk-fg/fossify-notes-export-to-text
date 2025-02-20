import {useState} from 'react'
import {Share, ToastAndroid} from 'react-native'
import styled from 'styled-components/native'
import Icon from 'react-native-vector-icons/Ionicons'
import Clipboard from '@react-native-clipboard/clipboard'
import {pick, types, isErrorWithCode, errorCodes} from '@react-native-documents/picker'
import {FileSystem} from 'react-native-file-access'
import ReceiveSharingIntent from 'react-native-receive-sharing-intent'


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

  const json_get_text = () => {
    try {
      let notes = JSON.parse(json)
      if (!Array.isArray(notes)) throw Error('Не экспорт списка Заметок')
      // notes.sort((a, b) => (a.id+1 || 9999) - (b.id+1 || 9999))
      return notes.map(n => [
        n.title ? `-- ${n.title}` : null,
        n.value ].filter(d => d).join('\n')).join('\n\n')
    } catch (err) { run_alert(`Ошибка JSON-данных:\n${err.message || err}`) } }

  // const run_alert = msg => alert(msg)
  const run_alert = msg =>
    ToastAndroid.showWithGravity(msg, ToastAndroid.SHORT, ToastAndroid.TOP)

  const run_share = async () => {
    const text = json_get_text(); if (!text) return
    try {
      const res = await Share.share({message: text})
      if (res.action === Share.dismissedAction) run_alert('Отправка отменена')
    } catch (err) { run_alert(`Ошибка отправки:\n${err.message || err}`) } }

  const run_copy = () => {
    const text = json_get_text(); if (!text) return
    Clipboard.setString(text)
    const [n_chars, n_words, n_lines] =
      [text.length, text.trim().split(/\s+/).length, text.split('\n').length]
        .map(n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
    run_alert( `Скопировано текстом\n[ ${n_lines}`+
      ` строк(и), ${n_words} слов, ${n_chars} букв ]` ) }

  const run_file_load = async () => {
    try {
      const [res] = await pick({mode: 'open'})
      if (!res.name) throw Error('Ничего не выбралось')
      if (res.size && res.size > 1048576)
        throw Error('Файл слишком большой (выбран по ошибке?)')
      const data = await FileSystem.readFile(res.uri)
      try { JSON.parse(data) } catch (err) {
        throw Error('Неверное содержимое файла - не JSON') }
      json_set(data)

    } catch (err) {
      if (!isErrorWithCode(err))
        return run_alert(`Ошибка загрузки файла:\n${err.message || err}`)
      switch (err.code) {
        case errorCodes.IN_PROGRESS: return run_alert('Экран выбора файла уже гдето открыт')
        case errorCodes.UNABLE_TO_OPEN_FILE_TYPE: return run_alert('Неподходящий тип файла')
        case errorCodes.OPERATION_CANCELED: return run_alert('Выбор файла отменен')
        default: return run_alert(`Ошибка выбора/загрузки файла:\n${err.message || err}`) } } }

	// [{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
	ReceiveSharingIntent.getReceivedFiles(files => {
		json_set(`URI: ${files[0].contentUri}`)
	}, err => json_set(`ERROR: ${err.message || err}`), 'FossifyNotesJSONExportShare')

  return (
    <WAppView>
    <WBtnRow>
      <WBtn icon='copy-outline' title='Скопировать' cb={run_copy} />
      <WBtn icon='share-social-outline' title='Отправить' cb={run_share} />
      <WBtn icon='push-outline' title='Загрузить файл' cb={run_file_load} />
    </WBtnRow>
    <WInput
      multiline
      // autoFocus={true}
      placeholder='Скопировать/вставить JSON сюда'
      onChangeText={text => json_set(text)}
      value={json} />
    </WAppView> )
}

export default App
