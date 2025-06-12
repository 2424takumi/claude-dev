/**
 * 実装テストスクリプト
 * Node.jsで実行して機能を確認
 */

import { share, shareStorage } from './js/utils/index.js';

async function runTests() {
    console.log('🧪 短縮URL実装テスト開始...\n');

    // テスト1: テキストのみのデータ
    console.log('📝 テスト1: テキストのみのデータ');
    try {
        const smallData = {
            size: 2,
            sections: [
                { title: '犬' }, { title: '猫' },
                { title: '鳥' }, { title: '魚' }
            ],
            bgColor: '#FF8B25',
            nickname: 'テスト太郎'
        };

        const baseUrl = 'https://example.com/shared.html';
        const url = await share.generateShortShareUrl(baseUrl, smallData);
        console.log(`✅ 生成されたURL: ${url}`);
        console.log(`   URL長: ${url.length} 文字`);
        
        // データが小さいので従来のURLが使われるはず
        if (url.includes('data=')) {
            console.log('   → 小さいデータなので従来方式を使用（期待通り）');
        }
    } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
    }

    console.log('\n📸 テスト2: 画像を含むデータ');
    try {
        // ダミー画像データ（Base64）
        const dummyImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';
        
        const largeData = {
            size: 3,
            sections: Array(9).fill({ title: 'テスト' }),
            bgColor: '#FF8B25',
            nickname: 'フォト花子',
            images: {
                0: dummyImage,
                4: dummyImage,
                8: dummyImage
            }
        };

        const baseUrl = 'https://example.com/shared.html';
        const url = await share.generateShortShareUrl(baseUrl, largeData);
        console.log(`✅ 生成されたURL: ${url}`);
        console.log(`   URL長: ${url.length} 文字`);
        
        // 画像があるので短縮URLが使われるはず
        if (url.includes('id=')) {
            console.log('   → 画像データがあるので短縮URL方式を使用（期待通り）');
            
            // IDを抽出してデータ取得テスト
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const retrievedData = await share.getShareData(urlParams);
            
            if (retrievedData && retrievedData.nickname === 'フォト花子') {
                console.log('   → データ取得成功！');
            }
        }
    } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
    }

    console.log('\n🔄 テスト3: 従来のURLとの互換性');
    try {
        const testData = {
            size: 2,
            sections: [{ title: 'A' }, { title: 'B' }, { title: 'C' }, { title: 'D' }],
            bgColor: '#000000'
        };

        // 従来の方法でエンコード
        const encodedData = share.encodeShareData(testData);
        const urlParams = new URLSearchParams();
        urlParams.set('data', encodedData);
        
        // デコードテスト
        const decodedData = await share.getShareData(urlParams);
        
        if (decodedData && decodedData.size === 2) {
            console.log('✅ 従来のエンコードされたURLからのデータ取得成功');
        }
    } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
    }

    console.log('\n📊 テスト4: URL長の比較');
    try {
        // 大きな画像データを含むテストデータ
        const bigImageData = 'data:image/jpeg;base64,' + 'A'.repeat(50000); // 約50KBの画像
        
        const bigData = {
            size: 3,
            sections: Array(9).fill({ title: 'ロングテキストタイトル' }),
            bgColor: '#FF8B25',
            nickname: 'ビッグデータユーザー',
            images: {
                0: bigImageData,
                1: bigImageData,
                2: bigImageData
            }
        };

        const baseUrl = 'https://example.com/shared.html';
        
        // 従来方式
        const traditionalUrl = share.generateShareUrl(baseUrl, bigData);
        console.log(`📏 従来方式のURL長: ${traditionalUrl.length.toLocaleString()} 文字`);
        
        // 新方式
        const shortUrl = await share.generateShortShareUrl(baseUrl, bigData);
        console.log(`📏 短縮URLの長さ: ${shortUrl.length} 文字`);
        
        const reduction = Math.round((1 - shortUrl.length / traditionalUrl.length) * 100);
        console.log(`✅ 削減率: ${reduction}%`);
        
        if (traditionalUrl.length > 2000) {
            console.log('⚠️  従来方式は2000文字制限を超過！');
        }
        if (shortUrl.length < 100) {
            console.log('✅ 短縮URLは常に100文字以下！');
        }
    } catch (error) {
        console.error(`❌ エラー: ${error.message}`);
    }

    console.log('\n✅ テスト完了！');
}

// テスト実行
runTests().catch(console.error);