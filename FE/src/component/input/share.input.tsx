import { APP_COLOR } from "@/utils/constant";
import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  KeyboardTypeOptions,
} from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const styles = StyleSheet.create({
  inputGruop: {
    padding: 5,
    gap: 10,
  },
  text: {
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  eye: {
    position: "absolute",
    right: 10,
    top: 18,
  },
});

interface Iprops {
  title?: string;
  keyboardType?: KeyboardTypeOptions;
  securityTextEntry?: boolean;
  value: any;
  setValue?: (v: any) => void;
  onChangeText?: (text: string) => void;
  onBlur?: any;
  error?: any;
  editable?: boolean;
}
const ShareInput = (props: Iprops) => {
  const {
    title,
    keyboardType,
    securityTextEntry = false,
    value,
    setValue,
    onChangeText,
    onBlur,
    error,
    editable = true,
  } = props;
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  return (
    <View>
      <View style={styles.inputGruop}>
        {title && <Text style={styles.text}>{title}</Text>}
        <View>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocus(true)}
            onBlur={(e) => {
              if (onBlur) onBlur(e);
              setIsFocus(false);
            }}
            keyboardType={keyboardType}
            style={[
              styles.input,
              { borderColor: isFocus ? APP_COLOR.ORANGE : APP_COLOR.GREY },
            ]}
            secureTextEntry={securityTextEntry && !isShowPassword}
            editable={editable}
          />
          {error && <Text style={{ color: "red", marginTop: 5 }}>{error}</Text>}
          {securityTextEntry && (
            <FontAwesome5
              style={styles.eye}
              name={isShowPassword ? "eye" : "eye-slash"}
              size={15}
              color="black"
              onPress={() => setIsShowPassword(!isShowPassword)}
            />
          )}
        </View>
      </View>
    </View>
  );
};
export default ShareInput;
