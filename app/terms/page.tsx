"use client";

// app/terms/page.tsx
// Terms of Service — EN / KO / JA fully translated.
// All other 7 locales fall back to EN.
// Language follows the global useLanguage() context (site-wide toggle).
//
// KOMOJU cross-border merchant compliance:
//   - Specified Commercial Transactions Act (特定商取引法) disclosure in JA
//   - Full business information as required by KOMOJU onboarding
//
// Last updated: 2026-05-02

import { useLanguage } from "@/lib/language-context";

// ─── Types ───────────────────────────────────────────────────────────
type Lang = "en" | "ko" | "ja";

function mapLocale(locale: string): Lang {
  const l = locale.toLowerCase();
  if (l.startsWith("ko")) return "ko";
  if (l.startsWith("ja")) return "ja";
  return "en";
}

// ─── Sub-components ──────────────────────────────────────────────────
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-foreground/80 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-3 py-2.5 border-b border-border/40 last:border-0">
      <span className="font-semibold text-foreground/70 text-xs leading-relaxed">
        {label}
      </span>
      <span className="text-foreground/90 text-sm leading-relaxed">{value}</span>
    </div>
  );
}

// ─── EN ──────────────────────────────────────────────────────────────
function TermsEN() {
  return (
    <>
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Terms of Service
        </h1>
        <p className="text-sm text-foreground/50">
          Last updated: May 2, 2026 &nbsp;·&nbsp; Effective immediately
        </p>
        <p className="mt-4 text-sm text-foreground/70 leading-relaxed">
          These Terms of Service govern your use of SajuAstrology (
          <a href="https://sajuastrology.com" className="underline text-primary">
            https://sajuastrology.com
          </a>
          ) and all associated mobile applications operated by Rimfactory
          (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or
          using our Service you agree to be bound by these Terms.
        </p>
      </header>

      <Section id="scta-en" title="1. Business Information &amp; Specified Commercial Transactions Act Disclosure">
        <p className="text-xs text-foreground/50 mb-4">
          The following disclosure is provided in accordance with Japan&apos;s
          Act on Specified Commercial Transactions (特定商取引法) and KOMOJU
          cross-border merchant requirements.
        </p>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <Row label="Seller / Operator" value="Rimfactory" />
          <Row label="Representative" value="Yun Choyeon (Chandler Yun)" />
          <Row label="Business Address" value="243, 97 Saemal-ro, Guro-gu, Seoul, Republic of Korea (08288)" />
          <Row label="Contact Email" value={<a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a>} />
          <Row label="Phone" value="Available upon request via info@rimfactory.io" />
          <Row label="Website" value={<a href="https://sajuastrology.com" className="underline text-primary">https://sajuastrology.com</a>} />
          <Row label="Service Launch Date" value="April 1, 2026" />
          <Row label="Products &amp; Services" value="AI-powered Saju (Four Pillars) astrology readings, compatibility analysis, and AI advisor subscription (Soram Companion). All services are delivered digitally." />
          <Row label="Pricing" value={
            <ul className="list-disc pl-4 space-y-1">
              <li>Free tier — $0 (1 daily Soram message included)</li>
              <li>Compatibility Full Reading — USD $2.99 (approx. ¥450)</li>
              <li>Soram Companion Monthly — USD $4.99/mo (approx. ¥750/mo)</li>
              <li>Full Destiny Reading — USD $9.99 (approx. ¥1,500)</li>
              <li>Master 5 Consultation Pack — USD $29.99 (approx. ¥4,500)</li>
              <li className="text-foreground/50 text-xs">Prices in USD. JPY equivalent varies with exchange rate.</li>
            </ul>
          } />
          <Row label="Payment Methods" value="PayPal, credit/debit cards (Visa, Mastercard, American Express) via PayPal checkout. Additional methods may be added." />
          <Row label="Payment Timing" value="One-time purchases charged immediately. Subscriptions charged monthly on the renewal date." />
          <Row label="Service Delivery" value="Digital services delivered immediately upon successful payment. AI readings generated within seconds. No physical goods shipped." />
          <Row label="Returns &amp; Cancellations" value={
            <span>
              Completed readings are non-refundable due to immediate digital delivery.
              Subscriptions may be cancelled anytime; access continues until period end with no partial refunds.
              For technical errors contact <a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a> within 7 days.
            </span>
          } />
          <Row label="System Requirements" value="Modern web browser (Chrome, Safari, Firefox, Edge) or iOS/Android app. Internet connection required." />
          <Row label="Disclaimer" value="Saju readings are for personal reflection and entertainment only. Not a substitute for medical, legal, financial, or psychological advice." />
        </div>
      </Section>

      <Section id="service-en" title="2. Service Description">
        <p>SajuAstrology provides AI-powered Four Pillars (Saju / 四柱推命) astrology analysis using the RimSaju Engine, combining classical astrological texts with large language model technology. Services include destiny readings, compatibility analysis, and the Soram AI advisor.</p>
        <p>All readings are AI-generated and intended for personal reflection and entertainment only.</p>
      </Section>

      <Section id="accounts-en" title="3. User Accounts">
        <p>Register via Google or Apple Sign-In. You are responsible for your account security. Accounts violating these Terms may be suspended or terminated.</p>
        <p>Birth data (date, time, location) is stored solely for personalized readings. Request data deletion anytime at <a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a>.</p>
      </Section>

      <Section id="payments-en" title="4. Payments &amp; Refunds">
        <p><strong>One-time purchases:</strong> Non-refundable after reading generation. <strong>Subscriptions:</strong> Cancel anytime; access continues to period end; no partial refunds. <strong>Exceptions:</strong> Technical errors on our side — contact us within 7 days.</p>
        <p>Prices in USD. Currency conversion handled by your payment provider.</p>
      </Section>

      <Section id="ip-en" title="5. Intellectual Property">
        <p>All content, software, and technology including the RimSaju Engine and Soram AI are exclusive intellectual property of Rimfactory. Unauthorized reproduction or commercial use is prohibited.</p>
      </Section>

      <Section id="privacy-en" title="6. Privacy">
        <p>We collect only what is needed to provide our services and do not sell personal data. We comply with GDPR and Korea&apos;s PIPA. Contact <a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a> for details.</p>
      </Section>

      <Section id="disclaimer-en" title="7. Disclaimer &amp; Limitation of Liability">
        <p>Service provided &quot;as is&quot; without warranties. Our total liability shall not exceed amounts paid in the 30 days preceding a claim. We are not liable for indirect or consequential damages to the extent permitted by law.</p>
      </Section>

      <Section id="law-en" title="8. Governing Law">
        <p>Governed by the laws of the Republic of Korea. Disputes subject to Seoul Central District Court jurisdiction, unless mandatory local consumer protection laws apply.</p>
      </Section>

      <Section id="contact-en" title="9. Contact">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <Row label="Company" value="Rimfactory" />
          <Row label="Representative" value="Yun Choyeon (Chandler Yun)" />
          <Row label="Email" value={<a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a>} />
          <Row label="Address" value="243, 97 Saemal-ro, Guro-gu, Seoul, Republic of Korea (08288)" />
        </div>
      </Section>
    </>
  );
}

// ─── KO ──────────────────────────────────────────────────────────────
function TermsKO() {
  return (
    <>
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">이용약관</h1>
        <p className="text-sm text-foreground/50">최종 업데이트: 2026년 5월 2일 · 즉시 적용</p>
        <p className="mt-4 text-sm text-foreground/70 leading-relaxed break-keep">
          본 이용약관은 림팩토리(이하 &quot;회사&quot;)가 운영하는 SajuAstrology(
          <a href="https://sajuastrology.com" className="underline text-primary">https://sajuastrology.com</a>
          ) 및 관련 모바일 애플리케이션의 이용에 관한 조건을 규정합니다. 서비스를 이용함으로써 본 약관에 동의한 것으로 간주됩니다.
        </p>
      </header>

      <Section id="bizinfo-ko" title="1. 사업자 정보">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <Row label="상호" value="림팩토리 (Rimfactory)" />
          <Row label="대표자" value="조연윤 (Yun Choyeon / Chandler Yun)" />
          <Row label="사업장 소재지" value="(08288) 서울특별시 구로구 새말로 97, 243호" />
          <Row label="이메일" value={<a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a>} />
          <Row label="전화" value="이메일로 문의 시 안내해 드립니다." />
          <Row label="서비스 URL" value={<a href="https://sajuastrology.com" className="underline text-primary">https://sajuastrology.com</a>} />
          <Row label="서비스 개시일" value="2026년 4월 1일" />
        </div>
      </Section>

      <Section id="service-ko" title="2. 서비스 내용">
        <p className="break-keep">SajuAstrology는 림사주(RimSaju) 엔진을 활용한 AI 기반 사주 분석 서비스입니다. 한국·중국의 고전 명리학 원전과 대규모 언어 모델(LLM) 기술을 결합하여 사주풀이, 궁합 분석, AI 어드바이저 &apos;소람(Soram)&apos; 서비스를 제공합니다.</p>
        <p className="break-keep">모든 결과는 AI가 생성하며 개인의 성찰과 오락 목적으로 제공됩니다. 의료·법률·재무·심리 상담을 대체하지 않습니다.</p>
      </Section>

      <Section id="payments-ko" title="3. 이용요금 및 결제">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <Row label="무료 플랜" value="소람 일일 1회 포함 · 무료" />
          <Row label="궁합 풀리딩" value="USD $2.99 (일회성)" />
          <Row label="소람 컴패니언 구독" value="USD $4.99/월 (소람 무제한 + 상담 1회 + 우선 응답 + 메모리)" />
          <Row label="풀 데스티니 리딩" value="USD $9.99 (일회성)" />
          <Row label="마스터 5 상담 팩" value="USD $29.99 (상담 5회)" />
          <Row label="결제 수단" value="PayPal, 신용/체크카드 (Visa, Mastercard, American Express)" />
          <Row label="결제 시점" value="일회성 결제는 구매 즉시, 구독은 매월 갱신일에 청구됩니다." />
          <Row label="서비스 제공" value="결제 완료 즉시 디지털로 제공됩니다. 실물 배송 없음." />
        </div>
      </Section>

      <Section id="refund-ko" title="4. 취소 및 환불">
        <p className="break-keep"><strong>일회성 결제:</strong> 사주 결과 생성 완료 후 환불 불가 (즉시 제공되는 디지털 서비스 특성).</p>
        <p className="break-keep"><strong>월정액 구독:</strong> 언제든지 해지 가능. 해지 후 당월 만료일까지 이용 가능. 일할 환불 없음.</p>
        <p className="break-keep"><strong>예외:</strong> 회사 측 기술적 오류로 서비스가 미제공된 경우 구매일로부터 7일 이내에 <a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a>로 문의하시면 개별 검토합니다.</p>
      </Section>

      <Section id="accounts-ko" title="5. 회원 계정">
        <p className="break-keep">Google 또는 Apple 계정으로 가입할 수 있습니다. 계정 정보의 안전한 관리는 회원의 책임입니다. 약관 위반 시 이용이 제한될 수 있습니다.</p>
        <p className="break-keep">입력하신 생년월일·시간·출생지는 개인화 서비스 제공에만 사용됩니다. 데이터 삭제 요청: <a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a></p>
      </Section>

      <Section id="ip-ko" title="6. 지식재산권">
        <p className="break-keep">SajuAstrology의 모든 콘텐츠·소프트웨어·기술(림사주 엔진, 소람 AI 포함)은 림팩토리의 배타적 지식재산입니다. 사전 서면 동의 없이 무단 복제·배포·상업적 이용은 금지됩니다.</p>
      </Section>

      <Section id="privacy-ko" title="7. 개인정보 처리">
        <p className="break-keep">수집된 정보는 서비스 제공 목적으로만 사용되며 제3자에게 판매되지 않습니다. 「개인정보 보호법」 및 GDPR을 준수합니다. 상세 내용 문의: <a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a></p>
      </Section>

      <Section id="disclaimer-ko" title="8. 면책 및 책임 제한">
        <p className="break-keep">서비스는 &quot;있는 그대로&quot; 제공되며 특정 목적에의 적합성을 보증하지 않습니다. 회사의 최대 책임은 청구일 이전 30일간 이용자가 지불한 금액을 초과하지 않습니다.</p>
      </Section>

      <Section id="law-ko" title="9. 준거법 및 분쟁 해결">
        <p className="break-keep">본 약관은 대한민국 법률에 따릅니다. 분쟁 발생 시 서울중앙지방법원을 전속 관할로 합니다. 단, 이용자 거주국의 강행 소비자보호법이 우선 적용될 수 있습니다.</p>
      </Section>

      <Section id="contact-ko" title="10. 문의처">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <Row label="상호" value="림팩토리 (Rimfactory)" />
          <Row label="대표자" value="조연윤 (Yun Choyeon)" />
          <Row label="이메일" value={<a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a>} />
          <Row label="주소" value="(08288) 서울특별시 구로구 새말로 97, 243호" />
        </div>
      </Section>
    </>
  );
}

// ─── JA ──────────────────────────────────────────────────────────────
function TermsJA() {
  return (
    <>
      <header className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">利用規約</h1>
        <p className="text-sm text-foreground/50">最終更新日：2026年5月2日 · 即日施行</p>
        <p className="mt-4 text-sm text-foreground/70 leading-relaxed">
          本利用規約は、Rimfactory（以下「当社」）が運営するSajuAstrology（
          <a href="https://sajuastrology.com" className="underline text-primary">https://sajuastrology.com</a>
          ）および関連モバイルアプリのご利用条件を定めるものです。サービスのご利用をもって本規約に同意したものとみなします。
        </p>
      </header>

      <Section id="scta-ja" title="1. 特定商取引法に基づく表記">
        <p className="text-xs text-foreground/50 mb-4">
          本項は特定商取引法（昭和51年法律第57号）に基づき、日本のお客様へのオンラインサービス提供に際して必要な事項を表記するものです。
        </p>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <Row label="販売業者" value="Rimfactory（リムファクトリー）" />
          <Row label="運営責任者" value="ユン・チョヨン（Yun Choyeon / Chandler Yun）" />
          <Row label="所在地" value="243, 97 Saemal-ro, Guro-gu, Seoul, Republic of Korea（郵便番号：08288）" />
          <Row label="お問い合わせメール" value={<a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a>} />
          <Row label="電話番号" value="info@rimfactory.io へご連絡いただければ、メールにてご案内いたします。" />
          <Row label="販売URL" value={<a href="https://sajuastrology.com" className="underline text-primary">https://sajuastrology.com</a>} />
          <Row label="サービス開始日" value="2026年4月1日" />
          <Row label="商品・役務の内容" value="AIを活用した四柱推命（사주）鑑定、相性診断、AIアドバイザー「ソラム（Soram）」サブスクリプション。すべてデジタル配信。" />
          <Row label="販売価格" value={
            <ul className="list-disc pl-4 space-y-1">
              <li>無料プラン — ¥0（ソラム毎日1回メッセージ含む）</li>
              <li>相性フルリーディング — 約¥450（USD $2.99）</li>
              <li>ソラムコンパニオン月額 — 約¥750/月（USD $4.99/月）</li>
              <li>フルデスティニーリーディング — 約¥1,500（USD $9.99）</li>
              <li>マスター5相談パック — 約¥4,500（USD $29.99）</li>
              <li className="text-foreground/50 text-xs">※価格はUSD建て。円換算は為替レートにより変動します。</li>
            </ul>
          } />
          <Row label="支払方法" value="PayPal、クレジット/デビットカード（Visa、Mastercard、American Express）によるPayPalチェックアウト。" />
          <Row label="支払時期" value="単発購入はチェックアウト時に即時決済。サブスクリプションは毎月の更新日に請求。" />
          <Row label="役務の提供時期" value="決済完了後、ただちにデジタルにて提供。AI鑑定結果は数秒以内に生成。物品の発送なし。" />
          <Row label="返品・解約について" value={
            <span>
              デジタルコンテンツの即時配信という性質上、鑑定結果生成後の返金は原則不可。
              月額サブスクは随時解約可能で、解約後は当月末まで利用可能（日割り返金なし）。
              当社側の技術的不具合の場合は購入日より7日以内に{" "}
              <a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a>
              {" "}までご連絡ください。
            </span>
          } />
          <Row label="動作環境" value="主要ブラウザ（Chrome・Safari・Firefox・Edge）またはiOS/Androidアプリ。安定したインターネット接続が必要。" />
          <Row label="注意事項" value="四柱推命鑑定は個人の内省・娯楽目的のみ。医療・法律・財務・心理的アドバイスの代替となるものではありません。" />
        </div>
      </Section>

      <Section id="service-ja" title="2. サービス内容">
        <p>SajuAstrologyは、RimSajuエンジンを用いたAI四柱推命鑑定サービスです。韓国・中国の古典命理学テキストと大規模言語モデル（LLM）を組み合わせ、運命鑑定・相性診断・AIアドバイザー「ソラム」サービスを提供します。</p>
        <p>すべての鑑定結果はAI生成です。個人の内省・娯楽目的でのご利用を想定しており、専門的助言の代替となるものではありません。</p>
      </Section>

      <Section id="accounts-ja" title="3. ユーザーアカウント">
        <p>GoogleまたはAppleアカウントでご登録いただけます。アカウント情報の管理はお客様の責任において行ってください。本規約に違反した場合、アカウントを停止または削除する場合があります。</p>
        <p>入力された生年月日・時刻・出生地は個人化サービス提供のみに使用します。データ削除のご依頼は <a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a> まで。</p>
      </Section>

      <Section id="payments-ja" title="4. 決済・返金">
        <p><strong>単発購入：</strong>鑑定結果生成後の返金は原則不可。<strong>月額サブスクリプション：</strong>随時解約可能。解約後は当月末まで利用可能（日割り返金なし）。<strong>例外：</strong>当社側の技術的不具合は購入日より7日以内にご連絡ください。</p>
      </Section>

      <Section id="ip-ja" title="5. 知的財産権">
        <p>RimSajuエンジン、ソラムAIキャラクター、生成された鑑定結果を含むすべてのコンテンツ・ソフトウェア・技術はRimfactoryの独占的知的財産です。無断複製・再配布・商業的利用は禁止されています。</p>
      </Section>

      <Section id="privacy-ja" title="6. プライバシー">
        <p>収集情報はサービス提供目的のみに使用し、第三者への販売は行いません。GDPRおよび韓国個人情報保護法（PIPA）を遵守します。詳細は <a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a> まで。</p>
      </Section>

      <Section id="disclaimer-ja" title="7. 免責事項・責任の制限">
        <p>サービスは「現状のまま」提供。当社の最大責任額は請求日以前30日間にお支払いいただいた金額を超えません。適用法令が許容する範囲で間接的損害等について責任を負いません。</p>
      </Section>

      <Section id="law-ja" title="8. 準拠法・紛争解決">
        <p>本規約は大韓民国法に準拠します。紛争はソウル中央地方法院を専属的合意管轄とします。ただし、お客様の居住国の強行的消費者保護法が優先する場合があります。</p>
      </Section>

      <Section id="contact-ja" title="9. お問い合わせ">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <Row label="会社名" value="Rimfactory（リムファクトリー）" />
          <Row label="運営責任者" value="ユン・チョヨン（Yun Choyeon）" />
          <Row label="メールアドレス" value={<a href="mailto:info@rimfactory.io" className="underline text-primary">info@rimfactory.io</a>} />
          <Row label="所在地" value="243, 97 Saemal-ro, Guro-gu, Seoul, Republic of Korea（08288）" />
        </div>
      </Section>
    </>
  );
}

// ─── Page root ───────────────────────────────────────────────────────
export default function TermsPage() {
  const { locale } = useLanguage();
  const lang = mapLocale(locale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">

        {lang === "ko" && <TermsKO />}
        {lang === "ja" && <TermsJA />}
        {lang === "en" && <TermsEN />}

        <p className="text-xs text-foreground/35 mt-10 text-center">
          © 2026 Rimfactory. All rights reserved.
        </p>
      </div>
    </main>
  );
}
