import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import ReactGA from 'react-ga4';

type ToneKey = 'soft' | 'standard' | 'firm';

interface ToneOption {
    key: ToneKey;
    label: string;
    emoji: string;
    desc: string;
}

interface SampleText {
    label: string;
    text: string;
}

interface GeminiResponse {
    revised: string;
    feedback: string;
}

export default function App() {
    const [originalText, setOriginalText] = useState<string>('');
    const [revisedText, setRevisedText] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [tone, setTone] = useState<ToneKey>('standard');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Track page view on mount
    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
    }, []);

    const toneOptions: ToneOption[] = [
        { key: 'soft', label: 'やわらかめ', emoji: '🌸', desc: '関係維持重視' },
        { key: 'standard', label: 'ふつう', emoji: '✉️', desc: 'バランス型' },
        { key: 'firm', label: 'しっかり', emoji: '📋', desc: '緊急性重視' }
    ];

    const toneInstructions: Record<ToneKey, string> = {
        soft: '相手との関係を最優先に考え、非常に丁寧で柔らかい表現を使用してください。申し訳なさを前面に出し、お願いベースの文面にしてください。',
        standard: 'ビジネスマナーに沿った標準的な丁寧さで、要件を明確に伝えつつも礼儀正しい表現を使用してください。',
        firm: '緊急性や重要性を明確に伝えつつも、失礼にならない範囲で強めの表現を使用してください。期限や影響を具体的に示してください。'
    };

    const handleRevise = async () => {
        if (!originalText.trim()) {
            setError('添削する文面を入力してください');
            return;
        }

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            setError('Gemini APIキーが設定されていません。.envファイルを確認してください。');
            return;
        }

        setIsLoading(true);
        setError('');
        setRevisedText('');
        setFeedback('');

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `あなたはビジネス文書の添削専門家です。以下の催促・リマインド文面を添削してください。

【トーン設定】
${toneInstructions[tone]}

【添削対象の文面】
${originalText}

以下のJSON形式で回答してください（JSONのみ、他のテキストは不要）：
{
  "revised": "添削後の文面（改行は\\nで表現）",
  "feedback": "改善ポイントの説明（Markdown形式の箇条書きで3-5点。例: - **ポイント1**: 説明\\n- **ポイント2**: 説明）"
}`
                            }]
                        }]
                    })
                }
            );

            const data = await response.json();

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                const jsonMatch = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]) as GeminiResponse;
                    setRevisedText(result.revised || '');
                    setFeedback(result.feedback || '');

                    // Track successful revision
                    ReactGA.event({
                        category: 'Revision',
                        action: 'revision_success',
                        label: tone,
                    });
                } else {
                    setError('AIからの応答を解析できませんでした');
                }
            } else if (data.error) {
                setError(`APIエラー: ${data.error.message || 'エラーが発生しました'}`);

                // Track API error
                ReactGA.event({
                    category: 'Error',
                    action: 'api_error',
                    label: data.error.message || 'unknown',
                });
            } else {
                setError('AIからの応答がありませんでした');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '不明なエラー';
            setError('エラーが発生しました: ' + errorMessage);

            // Track error
            ReactGA.event({
                category: 'Error',
                action: 'revision_error',
                label: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text: string): void => {
        navigator.clipboard.writeText(text);

        // Track copy action
        ReactGA.event({
            category: 'User',
            action: 'copy_text',
            label: 'revised_text',
        });
    };

    const handleSampleClick = (sampleLabel: string): void => {
        // Track sample text usage
        ReactGA.event({
            category: 'User',
            action: 'use_sample',
            label: sampleLabel,
        });
    };

    const handleToneChange = (newTone: ToneKey): void => {
        setTone(newTone);

        // Track tone selection
        ReactGA.event({
            category: 'User',
            action: 'select_tone',
            label: newTone,
        });
    };

    const sampleTexts: SampleText[] = [
        { label: '支払い', text: '先日お送りした請求書の件ですが、まだ入金が確認できていません。確認お願いします。' },
        { label: '返信', text: '先週メールした件、返事もらえますか？急ぎなので早めにお願いします。' },
        { label: '資料', text: '資料の提出期限過ぎてますけど、いつ出せますか？' }
    ];

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#FAF0ED' }}>
            {/* Floating decorations */}
            <div className="fixed top-20 right-10 text-6xl opacity-20 pointer-events-none select-none" style={{ writingMode: 'vertical-rl' }}>
                ふんわり
            </div>
            <div className="fixed bottom-20 left-10 text-4xl opacity-15 pointer-events-none select-none" style={{ writingMode: 'vertical-rl' }}>
                やさしく
            </div>

            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: '#E8A598' }}>
                        <span className="text-3xl">✉️</span>
                    </div>
                    <h1 className="text-2xl tracking-widest mb-4" style={{ color: '#5A4A42' }}>
                        催促文面添削
                    </h1>
                    <p className="text-sm tracking-wide" style={{ color: '#8B7B73' }}>
                        やさしく、でも、きちんと伝わる文面に。
                    </p>
                </header>

                {/* Main Card */}
                <div className="rounded-3xl p-8 md:p-12 shadow-sm" style={{ backgroundColor: '#FDF8F6' }}>

                    {/* Sample buttons */}
                    <div className="flex justify-center gap-3 mb-8">
                        <span className="text-xs" style={{ color: '#A89890' }}>お試し：</span>
                        {sampleTexts.map((sample, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setOriginalText(sample.text);
                                    handleSampleClick(sample.label);
                                }}
                                className="text-xs px-4 py-1.5 rounded-full transition-all hover:scale-105"
                                style={{
                                    backgroundColor: '#F5E6E0',
                                    color: '#7A6A62'
                                }}
                            >
                                {sample.label}
                            </button>
                        ))}
                    </div>

                    {/* Textarea */}
                    <div className="mb-8">
                        <textarea
                            value={originalText}
                            onChange={(e) => setOriginalText(e.target.value)}
                            placeholder="催促やリマインドの文面を入力してください..."
                            className="w-full h-44 p-6 rounded-2xl border-2 resize-none transition-all focus:outline-none"
                            style={{
                                backgroundColor: '#FFFFFF',
                                borderColor: '#EDE3DF',
                                color: '#5A4A42'
                            }}
                        />
                    </div>

                    {/* Tone Selection */}
                    <div className="mb-10">
                        <p className="text-center text-sm mb-4" style={{ color: '#8B7B73' }}>
                            トーンを選ぶ
                        </p>
                        <div className="flex justify-center gap-4">
                            {toneOptions.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => handleToneChange(option.key)}
                                    className={`relative px-6 py-4 rounded-2xl transition-all hover:scale-105 ${tone === option.key ? 'shadow-md' : ''
                                        }`}
                                    style={{
                                        backgroundColor: tone === option.key ? '#E8A598' : '#F5E6E0',
                                        color: tone === option.key ? '#FFFFFF' : '#7A6A62'
                                    }}
                                >
                                    <span className="block text-xl mb-1">{option.emoji}</span>
                                    <span className="block text-sm font-medium">{option.label}</span>
                                    <span className="block text-xs mt-1 opacity-70">{option.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            onClick={handleRevise}
                            disabled={isLoading || !originalText.trim()}
                            className={`px-12 py-4 rounded-full text-white font-medium tracking-wide transition-all ${isLoading || !originalText.trim()
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:scale-105 hover:shadow-lg'
                                }`}
                            style={{ backgroundColor: '#D4847A' }}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-3">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    添削しています...
                                </span>
                            ) : (
                                '添削する'
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 rounded-2xl text-center text-sm" style={{ backgroundColor: '#FCE8E6', color: '#C5534B' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {(revisedText || feedback) && (
                    <div className="mt-10 space-y-8">
                        {/* Revised Text */}
                        <div className="rounded-3xl p-8 md:p-10" style={{ backgroundColor: '#FDF8F6' }}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: '#D5EAD8' }}>
                                        ✓
                                    </span>
                                    <h2 className="text-lg" style={{ color: '#5A4A42' }}>添削後の文面</h2>
                                </div>
                                <button
                                    onClick={() => handleCopy(revisedText)}
                                    className="text-xs px-4 py-2 rounded-full transition-all hover:scale-105"
                                    style={{ backgroundColor: '#D5EAD8', color: '#4A6B4E' }}
                                >
                                    コピー
                                </button>
                            </div>
                            <div
                                className="p-6 rounded-2xl whitespace-pre-wrap leading-relaxed"
                                style={{ backgroundColor: '#F0F7F1', color: '#4A5A4C' }}
                            >
                                {revisedText}
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="rounded-3xl p-8 md:p-10" style={{ backgroundColor: '#FDF8F6' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: '#FDF0DC' }}>
                                    💡
                                </span>
                                <h2 className="text-lg" style={{ color: '#5A4A42' }}>改善ポイント</h2>
                            </div>
                            <div
                                className="p-6 rounded-2xl leading-relaxed text-sm markdown-content"
                                style={{ backgroundColor: '#FDF6ED', color: '#6B5A4A' }}
                            >
                                <ReactMarkdown>{feedback}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tips */}
                <div className="mt-16 text-center">
                    <p className="text-xs mb-4" style={{ color: '#A89890' }}>— 催促文のコツ —</p>
                    <div className="flex flex-wrap justify-center gap-4 text-xs" style={{ color: '#8B7B73' }}>
                        <span className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(232, 165, 152, 0.2)' }}>
                            クッション言葉を添える
                        </span>
                        <span className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(232, 165, 152, 0.2)' }}>
                            相手を責めない表現
                        </span>
                        <span className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(232, 165, 152, 0.2)' }}>
                            期限・背景を具体的に
                        </span>
                        <span className="px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(232, 165, 152, 0.2)' }}>
                            感謝で締める
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-16 text-center text-xs" style={{ color: '#B8A8A0' }}>
                    <p>やさしい言葉は、やさしい関係をつくる。</p>
                </footer>
            </div>
        </div>
    );
}
