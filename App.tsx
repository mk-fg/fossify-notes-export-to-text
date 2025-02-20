import React, {useState} from 'react';
import {styled} from 'styled-components';


const WAppView = styled.View`
  flex-direction: column;
  flex-grow: 1;
  padding-horizontal: 10px;
  padding-vertical: 10px;`

const WInput = styled.TextInput`
  flex: 1;
  padding: 5px;
  border: 1px #ddd solid;`

const WBtnRow = styled.View`
  padding: 10px;
  flex-direction: row;
  justify-content: center;`

const WBtnBox = styled.TouchableOpacity`
  elevation: 8;
  margin-horizontal: 10px;
  border-radius: 10px;
  padding-vertical: 10px;
  padding-horizontal: 12px;
  background-color: #555;`

const WBtnText = styled.Text`
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  align-self: center;
  text-transform: uppercase;`

const WBtn = ({title}) => (
  <WBtnBox>
    <WBtnText>{title}</WBtnText>
  </WBtnBox> )


const App = () => {
  const [json, json_set] = useState('')
  return (
    <WAppView>
    <WInput
      multiline
      //autoFocus={true}
      placeholder='Paste JSON here'
      placeholderTextColor='#999'
      onChangeText={text => json_set(text)}
      value={json}
      />
      <WBtnRow>
        <WBtn title='Share' /> <WBtn title='Copy' />
      </WBtnRow>
    </WAppView>
  )
}

export default App
