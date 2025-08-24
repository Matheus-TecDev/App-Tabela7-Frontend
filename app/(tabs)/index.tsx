import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinhaVeiculo, { Veiculo } from './LinhaVeiculo';
import TabelaHeader from './TabelaHeader';
import HeaderCustom from './HeaderCustom';
import { ThemedText } from '@/components/ThemedText'; // ajuste o caminho se necessário
import { useRouter } from 'expo-router';

export default function Home() {
  const [dados, setDados] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animated = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 14;

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const res = await fetch('https://backend-serven.onrender.com/aquisicoes');
        if (!res.ok) throw new Error('Falha ao buscar dados');
        const json = await res.json();
        setDados(json);

        Animated.timing(animated, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [animated]);

  const totalPaginas = Math.ceil(dados.length / itensPorPagina);
  const dadosPaginados = dados.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.errorText}>Erro: {error}</ThemedText>
      </View>
    );
  }

  return (
    <>
      <HeaderCustom />
      <ScrollView contentContainerStyle={styles.homeContainer}>
        <Animated.View
          style={[
            styles.animatedSection,
            {
              opacity: animated,
              transform: [
                {
                  translateY: animated.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ThemedText style={styles.sectionTitle}>Tabela de Veículos</ThemedText>

          <View>
            <TabelaHeader />
            <FlatList
              data={dadosPaginados}
              keyExtractor={(item) => item.NR_PLACA}
              renderItem={({ item, index }) => (
                <LinhaVeiculo item={item} index={index} />
              )}
              scrollEnabled={false}
            />

            {/* Paginação: só duas setas e info centralizada */}
            {totalPaginas > 1 && (
              <View style={styles.paginacaoContainer}>
                <ThemedText
                  style={[
                    styles.paginaBotao,
                    pagina === 1 && styles.paginaBotaoDesativado,
                  ]}
                  onPress={() => pagina > 1 && setPagina(pagina - 1)}
                >
                  {'«'}
                </ThemedText>
                <ThemedText style={styles.paginaInfo}>
                  {pagina} / {totalPaginas}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.paginaBotao,
                    pagina === totalPaginas && styles.paginaBotaoDesativado,
                  ]}
                  onPress={() => pagina < totalPaginas && setPagina(pagina + 1)}
                >
                  {'»'}
                </ThemedText>
              </View>
            )}

            {/* Botão Detalhes/Extrato centralizado logo abaixo da paginação */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/login')}
            >
              <ThemedText style={styles.buttonText}>Detalhes/Extrato</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    width: '100%',
    maxWidth: Dimensions.get('window').width,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 130,     // margem maior pra descolar do header
    paddingBottom: 80,
    backgroundColor: '#ffffff',
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  animatedSection: {
    width: '100%',
    overflow: 'hidden',
  },
  paginacaoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginaBotao: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007bff',
    color: '#007bff',
    fontSize: 18,
    marginHorizontal: 6,
    textAlign: 'center',
  },
  paginaBotaoDesativado: {
    opacity: 0.3,
  },
  paginaInfo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007bff',
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: '#e65100',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
