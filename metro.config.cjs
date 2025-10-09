// Learn more: https://github.com/kristerkari/react-native-svg-transformer
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

module.exports = (async () => {
	const defaultConfig = await getDefaultConfig(__dirname);
	const { assetExts, sourceExts } = defaultConfig.resolver;

	return mergeConfig(defaultConfig, {
		transformer: {
			babelTransformerPath: require.resolve('react-native-svg-transformer'),
		},
		resolver: {
			assetExts: assetExts.filter(ext => ext !== 'svg'),
			sourceExts: [...sourceExts, 'svg'],
		},
	});
})();
