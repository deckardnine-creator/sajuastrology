import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export const metadata = {
  title: "\u7279\u5b9a\u5546\u53d6\u5f15\u6cd5\u306b\u57fa\u3065\u304f\u8868\u8a18 | SajuAstrology",
  description: "\u7279\u5b9a\u5546\u53d6\u5f15\u6cd5\u306b\u57fa\u3065\u304f\u8868\u8a18 — SajuAstrology / Rimfactory",
  robots: {
    index: false,
    follow: true,
  },
}

export default function TokushohoPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-page pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-serif text-primary mb-2">{"\u7279\u5b9a\u5546\u53d6\u5f15\u6cd5\u306b\u57fa\u3065\u304f\u8868\u8a18"}</h1>
          <p className="text-sm text-muted-foreground mb-3">{"\u8868\u793a\u65e5\uff1a2026\u5e745\u67082\u65e5"}</p>
          <p className="text-sm text-foreground/80 mb-8">{"\u672c\u30da\u30fc\u30b8\u306f\u3001\u7279\u5b9a\u5546\u53d6\u5f15\u6cd5\u7b2c11\u6761\uff08\u901a\u4fe1\u8ca9\u58f2\u306b\u3064\u3044\u3066\u306e\u5e83\u544a\uff09\u306b\u57fa\u3065\u304f\u8868\u8a18\u3067\u3059\u3002"}</p>
          <dl className="text-sm text-foreground/90 leading-relaxed border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u8ca9\u58f2\u4e8b\u696d\u8005\u540d"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `Rimfactory` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u904b\u55b6\u8cac\u4efb\u8005"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `Yun Choyeon (Chandler Yun)` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u6240\u5728\u5730"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u301208288 \u5927\u97d3\u6c11\u56fd\u30bd\u30a6\u30eb\u7279\u5225\u5e02\u4e5d\u8001\u533a\u30bb\u30de\u30eb\u8def97\u3001\u65b0\u9053\u6797\u30c6\u30af\u30ce\u30de\u30fc\u30c81\u968e243\u53f7` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u96fb\u8a71\u756a\u53f7"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `+82-10-4648-6793<br /><span class="text-muted-foreground text-xs">\u55b6\u696d\u6642\u9593\uff1a\u5e73\u65e510:00\u201318:00 KST\uff08\u571f\u65e5\u795d\u4f11\uff09</span><br /><span class="text-muted-foreground text-xs">\u203b \u97d3\u56fd\u3092\u62e0\u70b9\u3068\u3059\u308b\u4e8b\u696d\u8005\u3067\u3042\u308b\u305f\u3081\u3001\u304a\u554f\u3044\u5408\u308f\u305b\u306f\u4e0b\u8a18\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9\u5b9b\u3067\u627f\u3063\u3066\u304a\u308a\u307e\u3059\u3002</span>` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `<a href="mailto:info@rimfactory.io" class="text-primary hover:underline">info@rimfactory.io</a>` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u4e8b\u696d\u8005\u767b\u9332\u756a\u53f7"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `402-44-01247\uff08\u5927\u97d3\u6c11\u56fd\u30fb\u56fd\u7a0e\u5e81\uff09` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u901a\u4fe1\u8ca9\u58f2\u696d\u7533\u544a\u756a\u53f7"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `2025-Seoul Guro-2056\uff08\u30bd\u30a6\u30eb\u7279\u5225\u5e02\u4e5d\u8001\u533a\uff09` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u30db\u30fc\u30e0\u30da\u30fc\u30b8URL"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `<a href="https://sajuastrology.com" class="text-primary hover:underline">https://sajuastrology.com</a>` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u5f79\u52d9\u306e\u5185\u5bb9"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u97d3\u56fd\u4f1d\u7d71\u306e\u56db\u67f1\u63a8\u547d\uff08\u547d\u7406\u5b66\uff09\u306b\u57fa\u3065\u304fAI\u751f\u6210\u30b3\u30f3\u30c6\u30f3\u30c4\u306e\u63d0\u4f9b\u3002\u9451\u5b9a\u66f8\u3001\u76f8\u6027\u5224\u65ad\u3001\u65e5\u3005\u306e\u904b\u52e2\u3001\u5bfe\u8a71\u578b\u76f8\u8ac7\uff08Soram Companion\uff09\u3092\u542b\u307f\u307e\u3059\u3002` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u8ca9\u58f2\u4fa1\u683c"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u5404\u5546\u54c1\u306e\u4fa1\u683c\u306f\u8cfc\u5165\u753b\u9762\u306b\u7c73\u30c9\u30eb\u5efa\u3066\u306b\u3066\u660e\u793a\u3057\u3066\u304a\u308a\u307e\u3059\u3002<br />\u30fbCompatibility Full\uff1aUS$2.99\uff08\u8cb7\u3044\u5207\u308a\uff09<br />\u30fbFull Destiny Reading\uff1aUS$9.99\uff08\u8cb7\u3044\u5207\u308a\uff09<br />\u30fbMaster 5 Pack\uff1aUS$29.99\uff08\u8cb7\u3044\u5207\u308a\u3001Full Destiny Reading \u3092\u542b\u3080\uff09<br />\u30fbSoram Companion\uff1aUS$4.99\uff0f\u6708\uff08\u81ea\u52d5\u66f4\u65b0\u30b5\u30d6\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\uff09<br /><span class="text-muted-foreground text-xs">\u203b \u70ba\u66ff\u30ec\u30fc\u30c8\u304a\u3088\u3073\u6c7a\u6e08\u4e8b\u696d\u8005\u306e\u63db\u7b97\u30ec\u30fc\u30c8\u306b\u3088\u308a\u3001\u5186\u5efa\u3066\u3067\u306e\u6700\u7d42\u6c7a\u6e08\u984d\u306f\u5909\u52d5\u3057\u307e\u3059\u3002</span>` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u5546\u54c1\u4ee3\u91d1\u4ee5\u5916\u306e\u5fc5\u8981\u6599\u91d1"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u30b5\u30fc\u30d3\u30b9\u306e\u3054\u5229\u7528\u306b\u5fc5\u8981\u306a\u901a\u4fe1\u56de\u7dda\u6599\u91d1\u7b49\u306f\u3001\u304a\u5ba2\u69d8\u306e\u3054\u8ca0\u62c5\u3068\u306a\u308a\u307e\u3059\u3002\u5f53\u793e\u304b\u3089\u306e\u8ffd\u52a0\u624b\u6570\u6599\u306f\u304b\u304b\u308a\u307e\u305b\u3093\u3002` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u304a\u652f\u6255\u3044\u65b9\u6cd5"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u30fb\u30a6\u30a7\u30d6\u30b5\u30a4\u30c8\uff1aPayPal Checkout\uff08PayPal \u6b8b\u9ad8\u3001Visa\u3001Mastercard\u3001American Express \u307b\u304b\u4e3b\u8981\u30d6\u30e9\u30f3\u30c9\u306e\u30af\u30ec\u30b8\u30c3\u30c8\u30ab\u30fc\u30c9\uff09<br />\u30fbiOS \u30a2\u30d7\u30ea\uff1aApple App Store \u306e\u30a2\u30d7\u30ea\u5185\u8ab2\u91d1<br />\u30fbAndroid \u30a2\u30d7\u30ea\uff1aGoogle Play \u306e\u30a2\u30d7\u30ea\u5185\u8ab2\u91d1` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u304a\u652f\u6255\u3044\u6642\u671f"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u3054\u6ce8\u6587\u78ba\u5b9a\u3068\u540c\u6642\u306b\u304a\u652f\u6255\u3044\u3044\u305f\u3060\u304d\u307e\u3059\u3002` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u5546\u54c1\u306e\u5f15\u6e21\u6642\u671f\uff08\u5f79\u52d9\u306e\u63d0\u4f9b\u6642\u671f\uff09"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u6c7a\u6e08\u5b8c\u4e86\u5f8c\u3001\u305f\u3060\u3061\u306b\u30c7\u30b8\u30bf\u30eb\u30b3\u30f3\u30c6\u30f3\u30c4\uff08AI\u751f\u6210\u306e\u9451\u5b9a\u66f8\uff09\u3092\u753b\u9762\u4e0a\u306b\u3066\u63d0\u4f9b\u3044\u305f\u3057\u307e\u3059\u3002Soram Companion \u6708\u984d\u30b5\u30d6\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\u306f\u3001\u6c7a\u6e08\u5b8c\u4e86\u5f8c\u305f\u3060\u3061\u306b\u6709\u52b9\u5316\u3055\u308c\u307e\u3059\u3002` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u8fd4\u54c1\u30fb\u4ea4\u63db\u30fb\u30ad\u30e3\u30f3\u30bb\u30eb\u306b\u3064\u3044\u3066"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u672c\u30b5\u30fc\u30d3\u30b9\u306f\u30c7\u30b8\u30bf\u30eb\u30b3\u30f3\u30c6\u30f3\u30c4\u306e\u6027\u8cea\u4e0a\u3001\u6c7a\u6e08\u5b8c\u4e86\u3092\u3082\u3063\u3066\u5f79\u52d9\u306e\u63d0\u4f9b\u304c\u958b\u59cb\u3055\u308c\u308b\u305f\u3081\u3001\u304a\u5ba2\u69d8\u306e\u3054\u90fd\u5408\u306b\u3088\u308b\u8fd4\u54c1\u30fb\u8fd4\u91d1\u306f\u539f\u5247\u3068\u3057\u3066\u304a\u53d7\u3051\u3067\u304d\u307e\u305b\u3093\u3002<br />\u305f\u3060\u3057\u3001\u6280\u8853\u7684\u306a\u969c\u5bb3\u306b\u3088\u308a\u5546\u54c1\uff08\u9451\u5b9a\u66f8\uff09\u304c\u6b63\u5e38\u306b\u63d0\u4f9b\u3055\u308c\u306a\u304b\u3063\u305f\u5834\u5408\u306b\u9650\u308a\u3001\u8cfc\u5165\u65e5\u304b\u30897\u65e5\u4ee5\u5185\u306b\u4e0b\u8a18\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9\u307e\u3067\u3054\u9023\u7d61\u3092\u3044\u305f\u3060\u3051\u308c\u3070\u3001\u3054\u8fd4\u91d1\u3044\u305f\u3057\u307e\u3059\u3002<br /><span class="text-muted-foreground text-xs">\u203b Apple App Store \u304a\u3088\u3073 Google Play \u306e\u30a2\u30d7\u30ea\u5185\u8ab2\u91d1\u306b\u3064\u3044\u3066\u306f\u3001\u5404\u30b9\u30c8\u30a2\u306e\u8fd4\u91d1\u30dd\u30ea\u30b7\u30fc\u306b\u5f93\u3044\u3001\u5404\u30b9\u30c8\u30a2\u5b9b\u3066\u306b\u76f4\u63a5\u304a\u7533\u3057\u8fbc\u307f\u304f\u3060\u3055\u3044\u3002\u5f53\u793e\u304b\u3089\u8fd4\u91d1\u51e6\u7406\u3092\u304a\u3053\u306a\u3046\u3053\u3068\u306f\u3067\u304d\u307e\u305b\u3093\u3002</span>` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"Soram Companion \u306e\u89e3\u7d04\u65b9\u6cd5"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u6708\u984d\u30b5\u30d6\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\u306f\u3001\u3044\u3064\u3067\u3082\u89e3\u7d04\u53ef\u80fd\u3067\u3059\u3002\u6b21\u56de\u66f4\u65b0\u65e5\u306e24\u6642\u9593\u4ee5\u4e0a\u524d\u306b\u89e3\u7d04\u624b\u7d9a\u304d\u3092\u5b8c\u4e86\u3059\u308b\u3053\u3068\u3067\u3001\u6b21\u56de\u8ab2\u91d1\u306f\u767a\u751f\u3044\u305f\u3057\u307e\u305b\u3093\u3002\u5f53\u6708\u5206\u306e\u9014\u4e2d\u89e3\u7d04\u306b\u3088\u308b\u65e5\u5272\u308a\u8fd4\u91d1\u306f\u304a\u3053\u306a\u3063\u3066\u304a\u308a\u307e\u305b\u3093\u3002<br />\u30fbiOS App Store\uff1a\u8a2d\u5b9a \u2192 [Apple ID \u540d] \u2192 \u30b5\u30d6\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3 \u2192 Soram Companion \u2192 \u30b5\u30d6\u30b9\u30af\u30ea\u30d7\u30b7\u30e7\u30f3\u3092\u30ad\u30e3\u30f3\u30bb\u30eb<br />\u30fbGoogle Play\uff1aPlay \u30b9\u30c8\u30a2 \u2192 \u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u30a2\u30a4\u30b3\u30f3 \u2192 \u304a\u652f\u6255\u3044\u3068\u5b9a\u671f\u8cfc\u5165 \u2192 \u5b9a\u671f\u8cfc\u5165 \u2192 Soram Companion \u2192 \u5b9a\u671f\u8cfc\u5165\u3092\u89e3\u7d04<br />\u30fb\u30a6\u30a7\u30d6\uff08PayPal\uff09\uff1a\u30de\u30a4\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9\u304b\u3089\u89e3\u7d04\u3001\u307e\u305f\u306f\u4e0b\u8a18\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9\u307e\u3067\u3054\u9023\u7d61\u304f\u3060\u3055\u3044\u3002PayPal \u81ea\u52d5\u652f\u6255\u3044\u306e\u7ba1\u7406\u753b\u9762\u304b\u3089\u76f4\u63a5\u306e\u89e3\u7d04\u3082\u53ef\u80fd\u3067\u3059\u3002` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u52d5\u4f5c\u74b0\u5883"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u30fb\u30a6\u30a7\u30d6\uff1a\u6a19\u6e96\u7684\u306a\u73fe\u884c\u30d6\u30e9\u30a6\u30b6\uff08Chrome\u3001Safari\u3001Firefox\u3001Edge \u306e\u6700\u65b0\u7248\u3092\u63a8\u5968\uff09<br />\u30fbiOS \u30a2\u30d7\u30ea\uff1aiOS 14.0 \u4ee5\u4e0a<br />\u30fbAndroid \u30a2\u30d7\u30ea\uff1aAndroid 7.0 \u4ee5\u4e0a` }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-1 md:gap-6 py-4 border-b border-border">
          <dt className="font-semibold text-primary">{"\u5229\u7528\u898f\u7d04\u30fb\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc\u30dd\u30ea\u30b7\u30fc"}</dt>
          <dd dangerouslySetInnerHTML={{ __html: `\u8a73\u7d30\u306f <a href="/terms" class="text-primary hover:underline">Terms of Service</a> \u304a\u3088\u3073 <a href="/privacy" class="text-primary hover:underline">Privacy Policy</a> \u3092\u3054\u53c2\u7167\u304f\u3060\u3055\u3044\u3002` }} />
        </div>
          </dl>
          <section className="mt-10 bg-card/50 border border-border rounded-xl p-5 text-xs">
            <h2 className="text-base font-serif text-primary mb-2">{"\u304a\u554f\u3044\u5408\u308f\u305b"}</h2>
            <p className="mb-1">{"\u672c\u8868\u8a18\u306e\u5185\u5bb9\u306b\u95a2\u3059\u308b\u304a\u554f\u3044\u5408\u308f\u305b\u306f\u3001\u4e0b\u8a18\u307e\u3067\u304a\u9858\u3044\u3044\u305f\u3057\u307e\u3059\u3002"}</p>
            <p className="mt-2"><strong>{"Rimfactory\uff08\u4e8b\u696d\u8005\u767b\u9332\u756a\u53f7 402-44-01247\u3001\u901a\u4fe1\u8ca9\u58f2\u696d\u7533\u544a\u756a\u53f7 2025-Seoul Guro-2056\uff09"}</strong></p>
            <p>{"\u301208288 \u5927\u97d3\u6c11\u56fd\u30bd\u30a6\u30eb\u7279\u5225\u5e02\u4e5d\u8001\u533a\u30bb\u30de\u30eb\u8def97\u3001\u65b0\u9053\u6797\u30c6\u30af\u30ce\u30de\u30fc\u30c81\u968e243\u53f7"}</p>
            <p className="mt-1">Email: <a href="mailto:info@rimfactory.io" className="text-primary hover:underline">info@rimfactory.io</a></p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
