import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { CommonButton } from '../../components/common-button/common-button';
import { CommonTextInput } from '../../components/common-text-input/common-text-input';
import { useTranslation } from '../../i18n/useTranslation';
import { useRechargeHistory } from '../recharge-history/recharge-history.hook';
import { useWallet } from './wallet.hook';
import { useWalletStyles } from './wallet.styles';
import { navigationService } from '../../navigation/navigation.service';

export function WalletScreen() {
  const styles = useWalletStyles();
  const { t } = useTranslation();
  const { balance, loading, error, submitRecharge } = useWallet();
  const { history } = useRechargeHistory();
  const [number, setNumber] = useState(''); const [operator, setOperator] = useState(''); const [amount, setAmount] = useState('');
  const isFormIncomplete = !number.trim() || !operator.trim() || !amount.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0;
  const normalizeNumber = (value: string) => value.replace(/\D/g, '');
  const submit = () => submitRecharge(number.trim(), operator.trim(), amount).then(success => { if (success) navigationService.navigate('RechargeHistory'); });
  const handleSubmit = () => {
    if (history.some(item => normalizeNumber(item.number) === normalizeNumber(number))) {
      Alert.alert(t('alreadyRechargeTitle'), t('alreadyRechargeMessage'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('continue'), onPress: submit },
      ]);
      return;
    }
    submit();
  };

  return (
    <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View><Text style={styles.title}>{t('wallet')}</Text><Text style={styles.subtitle}>{t('rechargeMobile')}</Text></View>
      <View style={styles.card}><Text style={styles.balanceLabel}>{t('availableBalance')}</Text><Text style={styles.balance}>₹{balance.toFixed(2)}</Text></View>
      <View style={styles.card}><Text style={styles.sectionTitle}>{t('rechargeMobile')}</Text>
        <Text style={styles.inputLabel}>{t('mobileNumberRequired')}</Text><CommonTextInput value={number} onChangeText={setNumber} keyboardType="phone-pad" placeholder={t('mobileNumber')} />
        <Text style={styles.inputLabel}>{t('operatorRequired')}</Text><CommonTextInput value={operator} onChangeText={setOperator} placeholder={t('operator')} />
        <Text style={styles.inputLabel}>{t('amountRequired')}</Text><CommonTextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder={t('amount')} />
        <CommonButton title={t('recharge')} disabled={loading || isFormIncomplete} onPress={handleSubmit} style={styles.rechargeButton} />
        {error ? <Text style={styles.error}>{t(error)}</Text> : null}
      </View>
      <Pressable accessibilityRole="link" onPress={() => navigationService.navigate('RechargeHistory')} style={styles.historyLink}>
        <Text style={styles.historyLinkText}>{t('history')}</Text>
      </Pressable>
    </ScrollView></SafeAreaView>
  );
}
