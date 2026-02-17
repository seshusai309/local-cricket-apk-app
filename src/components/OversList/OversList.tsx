import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Over } from '../../types';
import OverRow from '../OverRow/OverRow';

interface OversListProps {
  overs: Over[];
  currentOverNumber: number;
}

const OversList: React.FC<OversListProps> = ({ overs, currentOverNumber }) => {
  const renderOver = ({ item, index }: { item: Over; index: number }) => {
    const isCurrentOver = item.overNumber === currentOverNumber;
    return (
      <OverRow 
        over={item} 
        isCurrentOver={isCurrentOver}
      />
    );
  };

  const keyExtractor = (item: Over) => item.id;

  return (
    <View style={styles.container}>
      <FlatList
        data={overs}
        renderItem={renderOver}
        keyExtractor={keyExtractor}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default OversList;
