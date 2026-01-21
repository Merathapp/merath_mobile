# تطبيق حاسبة المواريث - دليل التطبيق التقني
## Implementation Guide: Android App Technical Requirements

**الإصدار:** 1.0  
**الحالة:** دليل شامل للمطورين  
**التاريخ:** يناير 2026

---

## 📦 البنية الأساسية للملفات

### المجلد `lib/inheritance/`

هذا المجلد يحتوي على جميع منطق حساب المواريث الشرعي:

```
lib/inheritance/
├── types.ts                    # تعريفات TypeScript
├── constants.ts                # الثوابت والقيم الافتراضية
├── fraction.ts                 # نظام الكسور
├── fiqh-database.ts            # قاعدة البيانات الفقهية
├── hijab-system.ts             # نظام الحجب
├── calculation-engine.ts       # محرك الحسابات
├── test-suite.ts               # نظام الاختبارات
├── audit-log.ts                # نظام تسجيل العمليات
└── utils.ts                    # دوال مساعدة
```

---

## 🔴 الملفات الحرجة

### 1. types.ts - التعريفات الأساسية

```typescript
// ====== أنواع البيانات الأساسية ======

export type MadhhabType = 'shafii' | 'hanafi' | 'maliki' | 'hanbali';

export type HeirType = 
  | 'husband' | 'wife'
  | 'son' | 'daughter'
  | 'father' | 'mother'
  | 'grandfather' | 'grandmother'
  | 'full_brother' | 'full_sister'
  | 'half_brother_paternal' | 'half_sister_paternal'
  | 'half_brother_maternal' | 'half_sister_maternal'
  | 'nephew' | 'niece'
  | 'uncle_paternal' | 'aunt_paternal';

export interface EstateData {
  total: number;          // إجمالي التركة بالريال
  funeral: number;        // تكاليف التجهيز
  debts: number;          // الديون المستحقة
  will: number;           // الوصية (تُحسب بثلث الباقي عادة)
}

export interface HeirsData {
  [key in HeirType]?: number;
}

export interface Fraction {
  numerator: number;      // البسط
  denominator: number;    // المقام
}

export interface HeirShare {
  key: HeirType;
  name: string;
  count: number;
  fraction: Fraction;     // النسبة الكسرية
  amount: number;         // المبلغ بالريال
  shares: {
    person: number;       // رقم الفرد
    amount: number;
  }[];
}

export interface CalculationResult {
  success: boolean;
  madhab: MadhhabType;
  madhhabName: string;
  shares: HeirShare[];
  specialCases: {
    awl: boolean;         // هل يوجد عول
    auled: number;        // مقدار العول
    radd: boolean;        // هل يوجد رد
    hijabTypes: string[]; // أنواع الحجب المطبقة
  };
  confidence: number;     // مستوى الثقة (0-100)
  steps: CalculationStep[];  // خطوات الحساب
  calculationTime: number;   // وقت الحساب بـ ms
  error?: string;         // رسالة الخطأ إن وجدت
}

export interface CalculationStep {
  stepNumber: number;
  title: string;
  description: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface MadhhabConfig {
  code: MadhhabType;
  name: string;
  description: string;
  color: string;
  icon: string;
  rules: MadhhabRules;
}

export interface MadhhabRules {
  // قواعد خاصة بالمذهب
  grandfather_with_siblings: 'hijab' | 'musharak';  // الجد مع الإخوة
  mother_with_father_children: 'third_of_remainder' | 'sixth';  // الأم مع الأب والأبناء
  mother_with_father_only: 'third' | 'sixth';       // الأم مع الأب فقط
  spouse_radd: boolean;                              // الرد على الزوج/الزوجة
  umariyyah_rule: 'first' | 'second';               // قاعدة العمرية
}

export interface TestCase {
  name: string;
  heirs: HeirsData;
  expected: Record<HeirType, number>;
  tolerance?: number;
  madhab?: MadhhabType;
  description: string;
}

export interface TestResult {
  name: string;
  madhab: MadhhabType;
  passed: boolean;
  skipped: boolean;
  error?: string;
  discrepancies?: string[];
  testTime: number;
}
```

### 2. fraction.ts - نظام الكسور

```typescript
/**
 * فئة الكسور المتقدمة للعمل مع الفروض الشرعية بدقة
 * 
 * الكسور المدعومة:
 * - 1/2 (النصف)
 * - 1/3, 2/3 (الثلث والثلثان)
 * - 1/4, 3/4 (الربع وثلاثة أرباع)
 * - 1/6, 5/6 (السدس وخمسة أسداس)
 * - 1/8, 7/8 (الثمن وسبعة أثمان)
 */

export class FractionClass {
  private numerator: number;
  private denominator: number;

  constructor(numerator: number, denominator: number = 1) {
    if (denominator === 0) {
      throw new Error('المقام لا يمكن أن يكون صفراً');
    }
    
    // تحويل الكسور السالبة
    if (denominator < 0) {
      numerator = -numerator;
      denominator = -denominator;
    }

    this.numerator = numerator;
    this.denominator = denominator;
    this.simplify();
  }

  /**
   * تبسيط الكسر
   */
  private simplify(): void {
    const gcd = this.gcd(Math.abs(this.numerator), this.denominator);
    this.numerator /= gcd;
    this.denominator /= gcd;
  }

  /**
   * حساب القاسم المشترك الأكبر
   */
  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * جمع كسرين
   */
  add(other: FractionClass): FractionClass {
    const newNumerator = 
      this.numerator * other.denominator + 
      other.numerator * this.denominator;
    const newDenominator = 
      this.denominator * other.denominator;
    
    return new FractionClass(newNumerator, newDenominator);
  }

  /**
   * طرح كسرين
   */
  subtract(other: FractionClass): FractionClass {
    const newNumerator = 
      this.numerator * other.denominator - 
      other.numerator * this.denominator;
    const newDenominator = 
      this.denominator * other.denominator;
    
    return new FractionClass(newNumerator, newDenominator);
  }

  /**
   * ضرب الكسر برقم
   */
  multiply(scalar: number | FractionClass): FractionClass {
    if (typeof scalar === 'number') {
      return new FractionClass(
        this.numerator * scalar,
        this.denominator
      );
    } else {
      return new FractionClass(
        this.numerator * scalar.numerator,
        this.denominator * scalar.denominator
      );
    }
  }

  /**
   * قسمة الكسر على رقم
   */
  divide(scalar: number | FractionClass): FractionClass {
    if (typeof scalar === 'number') {
      if (scalar === 0) {
        throw new Error('لا يمكن القسمة على صفر');
      }
      return new FractionClass(
        this.numerator,
        this.denominator * scalar
      );
    } else {
      return new FractionClass(
        this.numerator * scalar.denominator,
        this.denominator * scalar.numerator
      );
    }
  }

  /**
   * تحويل الكسر إلى عدد عشري
   */
  toDecimal(): number {
    return this.numerator / this.denominator;
  }

  /**
   * المساواة مع كسر آخر
   */
  equals(other: FractionClass, tolerance: number = 0.0001): boolean {
    return Math.abs(this.toDecimal() - other.toDecimal()) < tolerance;
  }

  /**
   * مقارنة الكسور
   */
  compare(other: FractionClass): number {
    const diff = this.toDecimal() - other.toDecimal();
    if (diff < -0.0001) return -1;
    if (diff > 0.0001) return 1;
    return 0;
  }

  /**
   * إرجاع الكسر كنص
   */
  toString(): string {
    if (this.denominator === 1) {
      return `${this.numerator}`;
    }
    return `${this.numerator}/${this.denominator}`;
  }

  /**
   * إرجاع الكسر باللغة العربية
   */
  toArabicName(): string {
    const key = `${this.numerator}/${this.denominator}`;
    const arabicFractions: Record<string, string> = {
      '1/2': 'النصف',
      '1/3': 'الثلث',
      '2/3': 'الثلثان',
      '1/4': 'الربع',
      '3/4': 'ثلاثة أرباع',
      '1/6': 'السدس',
      '5/6': 'خمسة أسداس',
      '1/8': 'الثمن',
      '7/8': 'سبعة أثمان',
      '1/1': 'كامل التركة',
      '0/1': 'لا شيء'
    };
    return arabicFractions[key] || key;
  }

  /**
   * الحصول على الأرقام
   */
  get numeratorValue(): number {
    return this.numerator;
  }

  get denominatorValue(): number {
    return this.denominator;
  }
}
```

### 3. fiqh-database.ts - قاعدة البيانات الفقهية

```typescript
import { MadhhabConfig, HeirType } from './types';

/**
 * قاعدة البيانات الفقهية الشاملة
 * تحتوي على جميع القواعس والأحكام الفقهية للمذاهب الأربعة
 */

export const FIQH_DATABASE = {
  // معلومات المذاهب
  madhabs: {
    shafii: {
      code: 'shafii',
      name: 'المذهب الشافعي',
      description: 'المذهب الشافعي',
      color: '#FF6B6B',
      icon: '🕌'
    },
    hanafi: {
      code: 'hanafi',
      name: 'المذهب الحنفي',
      description: 'المذهب الحنفي',
      color: '#4ECDC4',
      icon: '📖'
    },
    maliki: {
      code: 'maliki',
      name: 'المذهب المالكي',
      description: 'المذهب المالكي',
      color: '#45B7D1',
      icon: '⚖️'
    },
    hanbali: {
      code: 'hanbali',
      name: 'المذهب الحنبلي',
      description: 'المذهب الحنبلي',
      color: '#F7DC6F',
      icon: '📜'
    }
  } as Record<string, MadhhabConfig>,

  // الفروض الأساسية
  provisions: {
    husband: {
      name: 'الزوج',
      shares: {
        without_children: { numerator: 1, denominator: 2 },  // 1/2
        with_children: { numerator: 1, denominator: 4 }      // 1/4
      }
    },
    wife: {
      name: 'الزوجة',
      shares: {
        without_children: { numerator: 1, denominator: 4 },  // 1/4
        with_children: { numerator: 1, denominator: 8 }      // 1/8
      }
    },
    son: {
      name: 'الابن',
      type: 'asaba',  // عصبة
      shares: {}
    },
    daughter: {
      name: 'البنت',
      shares: {
        alone: { numerator: 1, denominator: 2 },              // 1/2
        with_siblings: { numerator: 2, denominator: 3 }      // 2/3
      }
    },
    father: {
      name: 'الأب',
      shares: {
        with_children: { numerator: 1, denominator: 6 },     // 1/6
        without_children: 'asaba'                             // عصبة
      }
    },
    mother: {
      name: 'الأم',
      shares: {
        with_children: { numerator: 1, denominator: 6 },     // 1/6
        without_children: { numerator: 1, denominator: 3 }   // 1/3
      }
    }
    // ... باقي الورثة
  },

  // قواعد الحجب
  hijabRules: {
    shafii: [
      { hijabber: 'son', hijabbed: ['full_brother', 'half_brother_paternal'] },
      { hijabber: 'father', hijabbed: ['grandfather'] },
      { hijabber: 'mother', hijabbed: ['grandmother'] },
      // ... المزيد من القواعس
    ],
    hanafi: [
      { hijabber: 'grandfather', target: 'full_brother', rule: 'musharak' },
      // ... القواعس الحنفية
    ],
    maliki: [
      { hijabber: 'grandfather', target: 'full_brother', rule: 'musharak' },
      // ... القواعس المالكية
    ],
    hanbali: [
      { hijabber: 'son', hijabbed: ['full_brother', 'half_brother_paternal'] },
      // ... القواعس الحنبلية
    ]
  },

  // الحالات الخاصة
  specialCases: {
    umariyyah: {
      description: 'العمرية: حالة خاصة للأم مع الأب والزوج/الزوجة',
      rules: {
        shafii: 'third_of_remainder',
        hanafi: 'third_of_remainder',
        maliki: 'sixth',
        hanbali: 'third_of_remainder'
      }
    },
    awl: {
      description: 'العول: عندما يتجاوز مجموع الفروض التركة'
    },
    radd: {
      description: 'الرد: عندما يبقى من التركة بعد الفروض'
    }
  }
};
```

### 4. calculation-engine.ts - محرك الحسابات

```typescript
import { Fraction, FractionClass } from './fraction';
import { FIQH_DATABASE } from './fiqh-database';
import {
  MadhhabType,
  HeirType,
  EstateData,
  HeirsData,
  CalculationResult,
  CalculationStep,
  HeirShare
} from './types';

/**
 * محرك الحسابات الرئيسي لحساب المواريث الشرعي
 * يدعم المذاهب الأربعة: الشافعي والحنفي والمالكي والحنبلي
 */

export class InheritanceCalculationEngine {
  private madhab: MadhhabType;
  private estate: EstateData;
  private heirs: HeirsData;
  private steps: CalculationStep[] = [];
  private currentStep: number = 0;

  constructor(
    madhab: MadhhabType,
    estate: EstateData,
    heirs: HeirsData
  ) {
    this.madhab = madhab;
    this.estate = estate;
    this.heirs = heirs;
  }

  /**
   * تنفيذ الحساب الكامل
   */
  calculate(): CalculationResult {
    const startTime = performance.now();
    
    try {
      // الخطوة 1: التحقق من صحة البيانات
      this.validateInput();

      // الخطوة 2: حساب التركة الصافية
      const netEstate = this.calculateNetEstate();

      // الخطوة 3: تحديد الورثة بعد الحجب
      const validHeirs = this.applyHijab();

      // الخطوة 4: تطبيق الفروض
      const provisioned = this.applyProvisions(validHeirs);

      // الخطوة 5: معالجة الحالات الخاصة (عول/رد)
      const shares = this.handleSpecialCases(provisioned, netEstate);

      // الخطوة 6: حساب المبالغ النهائية
      const finalShares = this.calculateFinalAmounts(shares, netEstate);

      const endTime = performance.now();

      return {
        success: true,
        madhab: this.madhab,
        madhhabName: FIQH_DATABASE.madhabs[this.madhab].name,
        shares: finalShares,
        specialCases: {
          awl: this.hasAwl(),
          auled: this.calculateAwlAmount(),
          radd: this.hasRadd(),
          hijabTypes: this.getHijabTypes()
        },
        confidence: this.calculateConfidence(),
        steps: this.steps,
        calculationTime: endTime - startTime
      };

    } catch (error) {
      return {
        success: false,
        madhab: this.madhab,
        madhhabName: FIQH_DATABASE.madhabs[this.madhab].name,
        shares: [],
        specialCases: {
          awl: false,
          auled: 0,
          radd: false,
          hijabTypes: []
        },
        confidence: 0,
        steps: this.steps,
        calculationTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      };
    }
  }

  /**
   * التحقق من صحة البيانات المدخلة
   */
  private validateInput(): void {
    if (!this.madhab) throw new Error('يجب اختيار مذهب فقهي');
    if (!this.estate.total || this.estate.total <= 0) {
      throw new Error('إجمالي التركة يجب أن يكون أكبر من صفر');
    }
    if (Object.keys(this.heirs).length === 0) {
      throw new Error('يجب تحديد ورثة واحد على الأقل');
    }

    this.addStep(
      'التحقق من البيانات',
      'تم التحقق من صحة جميع البيانات المدخلة بنجاح',
      'validate'
    );
  }

  /**
   * حساب التركة الصافية
   */
  private calculateNetEstate(): number {
    const net = 
      this.estate.total - 
      this.estate.funeral - 
      this.estate.debts;

    this.addStep(
      'حساب التركة الصافية',
      `التركة الصافية = ${this.estate.total} - ${this.estate.funeral} - ${this.estate.debts} = ${net}`,
      'estate_calculation',
      {
        total: this.estate.total,
        funeral: this.estate.funeral,
        debts: this.estate.debts,
        net: net
      }
    );

    return net;
  }

  /**
   * تطبيق الحجب
   */
  private applyHijab(): HeirsData {
    // تطبيق قواعد الحجب حسب المذهب
    // ...
    this.addStep('تطبيق الحجب', 'تم تطبيق قواعد الحجب', 'hijab');
    return this.heirs;
  }

  /**
   * تطبيق الفروض
   */
  private applyProvisions(heirs: HeirsData): Map<HeirType, FractionClass> {
    const shares = new Map<HeirType, FractionClass>();
    // تطبيق الفروض الشرعية
    // ...
    this.addStep('تطبيق الفروض', 'تم تطبيق الفروض الشرعية', 'provisions');
    return shares;
  }

  /**
   * معالجة الحالات الخاصة (عول/رد)
   */
  private handleSpecialCases(
    shares: Map<HeirType, FractionClass>,
    netEstate: number
  ): Map<HeirType, FractionClass> {
    // معالجة العول والرد
    // ...
    return shares;
  }

  /**
   * حساب المبالغ النهائية
   */
  private calculateFinalAmounts(
    shares: Map<HeirType, FractionClass>,
    netEstate: number
  ): HeirShare[] {
    const result: HeirShare[] = [];

    for (const [heirKey, fraction] of shares) {
      const amount = netEstate * fraction.toDecimal();
      
      result.push({
        key: heirKey as HeirType,
        name: this.getHeirName(heirKey as HeirType),
        count: this.heirs[heirKey as HeirType] || 0,
        fraction: {
          numerator: fraction.numeratorValue,
          denominator: fraction.denominatorValue
        },
        amount: amount,
        shares: this.distributeTo(heirKey as HeirType, amount)
      });
    }

    return result;
  }

  /**
   * توزيع المبلغ على الورثة
   */
  private distributeTo(heirKey: HeirType, amount: number): Array<{person: number, amount: number}> {
    const count = this.heirs[heirKey] || 0;
    const perPerson = amount / count;

    return Array.from({ length: count }, (_, i) => ({
      person: i + 1,
      amount: perPerson
    }));
  }

  // ... المزيد من الدوال المساعدة

  /**
   * إضافة خطوة إلى السجل
   */
  private addStep(
    title: string,
    description: string,
    action: string,
    details?: Record<string, any>
  ): void {
    this.steps.push({
      stepNumber: ++this.currentStep,
      title,
      description,
      action,
      details: details || {},
      timestamp: new Date().toISOString()
    });
  }

  private hasAwl(): boolean {
    // ...
    return false;
  }

  private calculateAwlAmount(): number {
    // ...
    return 0;
  }

  private hasRadd(): boolean {
    // ...
    return false;
  }

  private getHijabTypes(): string[] {
    // ...
    return [];
  }

  private calculateConfidence(): number {
    // حساب مستوى الثقة بناءً على عدد الحالات الخاصة
    return 100;
  }

  private getHeirName(heirKey: HeirType): string {
    // ...
    return '';
  }
}
```

---

## 🟡 ملفات الدعم

### 5. hijab-system.ts - نظام الحجب

```typescript
/**
 * نظام الحجب الفقهي الشامل
 * يطبق جميع قواعس الحجب حسب كل مذهب
 */

export class HijabSystem {
  private madhab: MadhhabType;

  constructor(madhab: MadhhabType) {
    this.madhab = madhab;
  }

  /**
   * تطبيق قواعس الحجب
   */
  applyHijab(heirs: HeirsData): HeirsData {
    const result = { ...heirs };

    // تطبيق الحجب الكامل
    this.applyCompleteHijab(result);

    // تطبيق الحجب الناقص
    this.applyPartialHijab(result);

    return result;
  }

  /**
   * الحجب الكامل: حرمان الوارث من الميراث كلياً
   */
  private applyCompleteHijab(heirs: HeirsData): void {
    // الابن يحجب الإخوة والأخوات
    if (heirs.son && heirs.son > 0) {
      heirs.full_brother = 0;
      heirs.full_sister = 0;
      heirs.half_brother_paternal = 0;
      heirs.half_sister_paternal = 0;
    }

    // الأب يحجب الجد
    if (heirs.father && heirs.father > 0) {
      heirs.grandfather = 0;
    }

    // الأم تحجب الجدات
    if (heirs.mother && heirs.mother > 0) {
      heirs.grandmother = 0;
    }
  }

  /**
   * الحجب الناقص: تقليل نصيب الوارث
   */
  private applyPartialHijab(heirs: HeirsData): void {
    // سيتم التعامل معه في محرك الحسابات
  }
}
```

### 6. test-suite.ts - نظام الاختبارات

```typescript
/**
 * نظام الاختبارات الشامل
 * يختبر جميع الحالات والسيناريوهات
 */

export class TestSuite {
  private tests: Map<string, TestCase[]> = new Map();
  private results: TestResult[] = [];

  constructor() {
    this.loadAllTests();
  }

  /**
   * تحميل جميع حالات الاختبار
   */
  private loadAllTests(): void {
    this.tests.set('basic', this.loadBasicTests());
    this.tests.set('umariyyah', this.loadUmariyyahTests());
    this.tests.set('awl', this.loadAwlTests());
    this.tests.set('radd', this.loadRaddTests());
    this.tests.set('hijab', this.loadHijabTests());
    this.tests.set('madhab_specific', this.loadMadhhabSpecificTests());
    this.tests.set('complex', this.loadComplexTests());
  }

  /**
   * تشغيل جميع الاختبارات
   */
  async runAllTests(primaryMadhab: MadhhabType = 'shafii'): Promise<void> {
    for (const [category, tests] of this.tests) {
      for (const test of tests) {
        const result = await this.runTest(test, category, test.madhab || primaryMadhab);
        this.results.push(result);
      }
    }
  }

  /**
   * تشغيل اختبار واحد
   */
  private async runTest(
    test: TestCase,
    category: string,
    madhab: MadhhabType
  ): Promise<TestResult> {
    const startTime = performance.now();

    try {
      const engine = new InheritanceCalculationEngine(madhab, {
        total: 120000,
        funeral: 0,
        debts: 0,
        will: 0
      }, test.heirs);

      const result = engine.calculate();

      if (!result.success) {
        return {
          name: test.name,
          madhab,
          passed: false,
          skipped: false,
          error: result.error,
          testTime: performance.now() - startTime
        };
      }

      // التحقق من النتائج
      const passed = this.verifyResults(test, result);

      return {
        name: test.name,
        madhab,
        passed,
        skipped: false,
        testTime: performance.now() - startTime
      };

    } catch (error) {
      return {
        name: test.name,
        madhab,
        passed: false,
        skipped: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        testTime: performance.now() - startTime
      };
    }
  }

  /**
   * التحقق من النتائج
   */
  private verifyResults(test: TestCase, result: CalculationResult): boolean {
    for (const [heirKey, expectedFraction] of Object.entries(test.expected)) {
      const heir = result.shares.find(s => s.key === heirKey as HeirType);
      if (!heir) continue;

      const actualFraction = heir.fraction.numerator / heir.fraction.denominator;
      const tolerance = test.tolerance || 0.02;

      if (Math.abs(actualFraction - expectedFraction) > tolerance) {
        return false;
      }
    }

    return true;
  }

  // ... تحميل حالات الاختبار المختلفة
  private loadBasicTests(): TestCase[] { return []; }
  private loadUmariyyahTests(): TestCase[] { return []; }
  private loadAwlTests(): TestCase[] { return []; }
  private loadRaddTests(): TestCase[] { return []; }
  private loadHijabTests(): TestCase[] { return []; }
  private loadMadhhabSpecificTests(): TestCase[] { return []; }
  private loadComplexTests(): TestCase[] { return []; }

  /**
   * الحصول على نتائج الاختبارات
   */
  getResults(): TestResult[] {
    return this.results;
  }

  /**
   * حساب إحصائيات الاختبارات
   */
  getStatistics() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed && !r.skipped).length;

    return {
      total,
      passed,
      failed,
      percentage: ((passed / total) * 100).toFixed(1)
    };
  }
}
```

### 7. audit-log.ts - نظام تسجيل العمليات

```typescript
/**
 * نظام المراجعة والتسجيل
 * يسجل جميع العمليات والحسابات
 */

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: Record<string, any>;
  component?: string;
}

export class AuditLog {
  private entries: AuditEntry[] = [];
  private maxEntries: number = 1000;

  /**
   * إضافة إدخال إلى السجل
   */
  add(
    action: string,
    type: AuditEntry['type'],
    message: string,
    details?: Record<string, any>,
    component?: string
  ): void {
    const entry: AuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      action,
      type,
      message,
      details,
      component
    };

    this.entries.unshift(entry);

    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }
  }

  /**
   * البحث في السجل
   */
  search(query: string): AuditEntry[] {
    return this.entries.filter(entry =>
      entry.action.toLowerCase().includes(query.toLowerCase()) ||
      entry.message.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * الفلترة حسب النوع
   */
  filterByType(type: AuditEntry['type']): AuditEntry[] {
    return this.entries.filter(entry => entry.type === type);
  }

  /**
   * الحصول على جميع الإدخالات
   */
  getAll(): AuditEntry[] {
    return this.entries;
  }

  /**
   * مسح السجل
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * توليد معرف فريد
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * تصدير السجل
   */
  export(format: 'json' | 'csv' | 'text' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.entries, null, 2);
    }
    // ...
    return '';
  }
}
```

---

## 📊 مثال التطبيق النهائي

```typescript
// استخدام المحرك في React Native

import { InheritanceCalculationEngine } from '@/lib/inheritance/calculation-engine';
import { AuditLog } from '@/lib/inheritance/audit-log';

export const calculateInheritance = async (
  madhab: MadhhabType,
  estate: EstateData,
  heirs: HeirsData
) => {
  const auditLog = new AuditLog();

  try {
    auditLog.add('calculation_started', 'info', `بدء الحساب للمذهب: ${madhab}`);

    const engine = new InheritanceCalculationEngine(madhab, estate, heirs);
    const result = engine.calculate();

    if (result.success) {
      auditLog.add('calculation_success', 'success', 'تم الحساب بنجاح', {
        madhab,
        sharesCount: result.shares.length
      });
    } else {
      auditLog.add('calculation_failed', 'error', result.error || 'فشل الحساب');
    }

    return { result, auditLog: auditLog.getAll() };

  } catch (error) {
    auditLog.add(
      'calculation_error',
      'error',
      error instanceof Error ? error.message : 'خطأ غير معروف'
    );
    throw error;
  }
};
```

---

## ✅ قائمة التحقق من التطابق

- [ ] تم نقل جميع الكسور بنفس الدقة
- [ ] تم تطبيق الحجب كاملاً
- [ ] تم دعم المذاهب الأربعة
- [ ] تم تطبيق العول والرد
- [ ] تم تشغيل جميع الاختبارات بنجاح
- [ ] جميع النتائج تطابق النتائج المتوقعة
- [ ] السجل يسجل جميع العمليات
- [ ] الأداء مقبول (< 100ms للحسابات)

---

## 📞 الدعم والمراجع

- الملف الرئيسي: `Merath_Calculator_6.html`
- التحليل الشامل: `COMPREHENSIVE_ANALYSIS.md`
- خطة التطوير: `DEVELOPMENT_PLAN.md`
- دليل المحاذاة: `ANDROID_APP_ALIGNMENT_ANALYSIS.md`
