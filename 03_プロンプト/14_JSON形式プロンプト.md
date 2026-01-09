# 詳細
- JSON（JavaScript Object Notation）形式を活用してプロンプトのデータ構造を定義し、キー
- バリューペアにより情報を構造化する技法。データ交換やAPI連携に最適で、プログラム的な処理にも対応できます。

# テンプレート
**基本構造**
```json
{
  "task": {
    "context": "[背景情報]",
    "input_data": {
      "source": "[データソース]",
      "format": "[入力形式]",
      "constraints": ["制約1", "制約2"]
    },
    "processing": {
      "method": "[処理方法]",
      "parameters": {
        "param1": "value1",
        "param2": "value2"
      }
    },
    "output": {
      "format": "[出力形式]",
      "fields": ["field1", "field2", "field3"]
    }
  }
}
```

**実行例**
```json
{
  "analysis_task": {
    "data": "sales_2024.csv",
    "type": "trend_analysis",
    "output": "summary_report"
  }
}
```

# 例
顧客データベース管理システム

以下のJSON形式に従って顧客情報を分析し、マーケティング戦略を提案してください。

## データ構造
```json
{
  "customer_profile": {
    "basic_info": {
      "id": "CU001",
      "name": "田中太郎",
      "age": 35,
      "gender": "male"
    },
    "purchase_history": [
      {
        "product": "スマートフォン",
        "price": 89800,
        "date": "2024-01-15"
      },
      {
        "product": "ワイヤレスイヤホン",
        "price": 12800,
        "date": "2024-02-20"
      }
    ],
    "preferences": {
      "categories": ["IT機器", "ガジェット"],
      "price_range": "middle",
      "communication": "email"
    }
  }
}

```

## 分析要件
- 購買パターンの特定
- 推奨商品の選定（3つ）
- 最適なアプローチ方法の提案