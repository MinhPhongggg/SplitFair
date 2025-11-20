// src/component/SkiaPieChart.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// 1. Import thêm 'Group' từ skia
import { Canvas, Path, Group } from '@shopify/react-native-skia';
import * as d3 from 'd3-shape';

interface PieChartData {
  value: number;
  color: string;
  key: string;
}

interface SkiaPieChartProps {
  data: PieChartData[];
  size: number;
  totalValue: number;
}

const SkiaPieChart = ({ data, size, totalValue }: SkiaPieChartProps) => {
  const radius = size / 2;
  const innerRadius = radius * 0.6; // Lỗ rỗng 60%
  const center = { x: radius, y: radius }; // 2. Định nghĩa tọa độ tâm

  // Dùng d3-shape để tính toán các "miếng"
  const pieGenerator = d3
    .pie<PieChartData>()
    .value((d) => d.value)
    .sort(null);

  // Dùng d3-shape để vẽ cung tròn
  const arcGenerator = d3
    .arc()
    .outerRadius(radius)
    .innerRadius(innerRadius)
    .padAngle(0.02);

  const pieSlices = pieGenerator(data);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas style={{ width: size, height: size }}>
        {/* 3. Bọc các Path trong một <Group> và di chuyển nó vào TÂM */}
        <Group transform={[{ translateX: center.x }, { translateY: center.y }]}>
          {pieSlices.map((slice, index) => {
            const path = arcGenerator(slice as any);
            if (!path) return null;

            return (
              <Path
                key={data[index].key}
                path={path}
                color={data[index].color}
                style="fill"
              />
            );
          })}
        </Group>
      </Canvas>
      {/* Text ở giữa */}
      <View style={styles.centerTextContainer}>
        <Text style={styles.centerText}>
          {totalValue.toLocaleString('vi-VN')}
        </Text>
        <Text style={styles.centerLabel}>VND</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  centerLabel: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
});

export default SkiaPieChart;