# 詳細
- XMLタグを使用してプロンプトの各要素を構造化し、AIが情報を正確に理解
- 処理できるようにする技法。開始タグと終了タグで情報を明確に区分し、階層構造により複雑な指示も体系的に整理できます。

# テンプレート
**基本構造**
<task>
  <context>
    [背景情報]
  </context>
  
  <requirements>
    <input>[入力データ]</input>
    <output>[期待する出力形式]</output>
    <constraints>[制約条件]</constraints>
  </requirements>
  
  <instructions>
    [具体的な指示内容]
  </instructions>
</task>

**実行例**
```xml
<analysis_task>
  <data_source>売上データ2024年</data_source>
  <analysis_type>トレンド分析</analysis_type>
  <output_format>グラフ付きレポート</output_format>
</analysis_task>
```

# 例
商品データベースの構造化処理

<product_analysis>
  <basic_info>
    <name>スマートウォッチ Pro</name>
    <category>ウェアラブルデバイス</category>
    <price>29,800円</price>
  </basic_info>
  
  <features>
    <health_monitoring>心拍数・血中酸素・睡眠分析</health_monitoring>
    <connectivity>Bluetooth 5.0・Wi-Fi・GPS内蔵</connectivity>
    <battery>最大7日間連続使用</battery>
  </features>
  
  <target_users>
    <primary>健康志向の20-40代</primary>
    <secondary>スポーツ愛好家・ビジネスパーソン</secondary>
  </target_users>
</product_analysis>

## 出力指示
各タグ内の情報を分析し、`マーケティング戦略`を提案してください。