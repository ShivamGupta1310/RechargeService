import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { CommonButton } from '../../components/common-button/common-button';
import { useTranslation } from '../../i18n/useTranslation';
import { useRechargeHistory } from './recharge-history.hook';
import { useRechargeHistoryStyles } from './recharge-history.styles';
import { navigationService } from '../../navigation/navigation.service';

export function RechargeHistoryScreen() {
  const styles = useRechargeHistoryStyles();
  const { t } = useTranslation();
  const { history, error } = useRechargeHistory();
  const statusStyle = (status: string) => status === 'SUCCESS' ? styles.statusSuccess : status === 'FAILED' || status === 'REFUNDED' ? styles.statusDanger : styles.statusWarning;

  return (
    <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>{t('rechargeHistory')}</Text>
      <Text style={styles.subtitle}>{t('rechargeHistorySubtitle')}</Text>
      <View style={styles.card}>
        {history.length === 0 ? <Text style={styles.subtitle}>{t('noRecharges')}</Text> : history.map(item => <View key={item.id} style={styles.historyItem}><View style={styles.historyRow}><Text style={styles.historyText}>{item.number}</Text><Text style={styles.historyText}>₹{item.amount.toFixed(2)}</Text></View><View style={styles.historyRow}><Text style={styles.historyMeta}>{item.operator}</Text><Text style={[styles.historyMeta, statusStyle(item.status)]}>{t(`statuses.${item.status}`)}</Text></View></View>)}
      </View>
      {error ? <Text style={styles.error}>{t(error)}</Text> : null}
      <CommonButton title={t('backToRecharge')} onPress={() => navigationService.goBack()} />
    </ScrollView></SafeAreaView>
  );
}
