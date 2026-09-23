'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Locale = 'en' | 'ja';

export const translations = {
  en: {
    portalTitle: 'Japanese Learning Portal',
    home: 'Home',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    logout: 'Logout',
    eyebrow: 'Study space',
    title: 'Japanese Learning Hub',
    subtitle: 'A calm space for Japanese learners to practice, track progress, and keep their study journey organized.',
    progressTitle: 'Learner progress',
    forms: 'dictionary forms',
    noLearners: 'No learner records found yet.',
    welcomeBack: 'Welcome back',
    email: 'Email',
    password: 'Password',
    signingIn: 'Signing in...',
    invalidLogin: 'Invalid email or password.',
    loginFailed: 'Login failed. Please try again.',
    needAccount: 'Need an account?',
    createAccount: 'Create account',
    name: 'Name',
    confirmPassword: 'Confirm password',
    creating: 'Creating...',
    alreadyHaveAccount: 'Already have an account?',
    sendVerificationCode: 'Send verification code',
    sendingCode: 'Sending...',
    verifyEmail: 'Verify email',
    verifyYourEmail: 'Verify your email',
    verificationCode: 'Verification code',
    verifying: 'Verifying...',
    resendCode: 'Resend code',
    resendIn: 'Resend in',
    codeSent: 'Verification code sent. Please check your inbox.',
    enterVerificationCode: "We've sent a 6-digit verification code to",
    emailVerified: 'Email verified. Now set your password for',
    manageTitle: 'Manage your Japanese verbs',
    manageDescription: 'Log in to build and manage your own Japanese grammar sheet.',
    myVocabulary: 'My vocabulary',
    welcome: 'Welcome',
    vocabularyDescription: 'Keep every Japanese verb form in one personal sheet.',
    addVerb: 'Add verb',
    downloadCsv: 'Download CSV',
    loadingVerbs: 'Loading your verbs...',
    addMoreVerbs: 'Add more verbs',
    back: 'Back',
    actions: 'Actions',
    defaultRow: 'Default',
    defaultRowTitle: 'Default sample row (immutable)',
    editVerb: 'Edit verb',
    deleteVerb: 'Delete verb',
    verbForms: 'Verb forms',
    close: 'Close',
    clear: 'Clear',
    delete: 'Delete',
    submit: 'Submit',
    saving: 'Saving...',
    deleting: 'Deleting...',
    confirmDeletion: 'Confirm deletion',
    typeDelete: 'Type DELETE to continue',
    deleteHelp: 'This prevents accidental removal of the verb.',
    unsavedChanges: 'Unsaved changes',
    closeWithoutSubmitting: 'Close without submitting?',
    lostDataWarning: 'You have entered data that will be lost.',
    keepEditing: 'Keep editing',
    closeAnyway: 'Close anyway',
    retry: 'Retry',
    verbAdded: 'Verb added successfully.',
    verbUpdated: 'Verb updated successfully.',
    verbDeleted: 'Verb deleted successfully.',
    unableLoadVerbs: 'Unable to load verbs.',
    unableSaveVerb: 'Unable to save verb.',
    unableDeleteVerb: 'Unable to delete verb.',
    duplicateVerb: 'Verb already saved.',
    refresh: 'Refresh',
  },
  ja: {
    portalTitle: '日本語学習ポータル',
    home: 'ホーム',
    login: 'ログイン',
    register: '登録',
    dashboard: 'ダッシュボード',
    logout: 'ログアウト',
    eyebrow: 'べんきょうの ばしょ',
    title: 'にほんごを たのしく まなぼう',
    subtitle: 'にほんごを まなんで じょうずに なりたい ひとの ための べんきょう ばしょです。',
    progressTitle: 'みんなの べんきょう',
    forms: 'どうし',
    noLearners: 'がくしゅうしゃの きろくは まだありません。',
    welcomeBack: 'おかえりなさい',
    email: 'メール',
    password: 'パスワード',
    signingIn: 'ログイン中...',
    invalidLogin: 'メールまたはパスワードが正しくありません。',
    loginFailed: 'ログインできませんでした。もう一度お試しください。',
    needAccount: 'アカウントが必要ですか？',
    createAccount: 'アカウントを作成',
    name: '名前',
    confirmPassword: 'パスワード確認',
    creating: '作成中...',
    alreadyHaveAccount: 'すでにアカウントがありますか？',
    sendVerificationCode: '確認コードを送信',
    sendingCode: '送信中...',
    verifyEmail: 'メールを確認',
    verifyYourEmail: 'メールを確認してください',
    verificationCode: '確認コード',
    verifying: '確認中...',
    resendCode: 'コードを再送信',
    resendIn: '再送信まで',
    codeSent: '確認コードを送信しました。受信箱を確認してください。',
    enterVerificationCode: '6桁の確認コードを送信しました:',
    emailVerified: 'メールを確認しました。パスワードを設定してください:',
    manageTitle: '日本語の動詞を管理',
    manageDescription: 'ログインして自分の日本語文法シートを作成・管理しましょう。',
    myVocabulary: '私の単語',
    welcome: 'ようこそ',
    vocabularyDescription: '日本語の動詞活用を自分専用のシートで管理できます。',
    addVerb: '動詞を追加',
    downloadCsv: 'CSVをダウンロード',
    loadingVerbs: '動詞を読み込み中...',
    addMoreVerbs: 'さらに動詞を追加',
    back: '戻る',
    actions: '操作',
    defaultRow: 'デフォルト',
    defaultRowTitle: 'デフォルトのサンプル行（編集不可）',
    editVerb: '動詞を編集',
    deleteVerb: '動詞を削除',
    verbForms: '動詞の形',
    close: '閉じる',
    clear: 'クリア',
    delete: '削除',
    submit: '送信',
    saving: '保存中...',
    deleting: '削除中...',
    confirmDeletion: '削除の確認',
    typeDelete: '続けるには DELETE と入力してください',
    deleteHelp: '誤って動詞を削除しないための確認です。',
    unsavedChanges: '未保存の変更',
    closeWithoutSubmitting: '送信せずに閉じますか？',
    lostDataWarning: '入力したデータは失われます。',
    keepEditing: '編集を続ける',
    closeAnyway: '閉じる',
    retry: '再試行',
    verbAdded: '動詞を追加しました。',
    verbUpdated: '動詞を更新しました。',
    verbDeleted: '動詞を削除しました。',
    unableLoadVerbs: '動詞を読み込めませんでした。',
    unableSaveVerb: '動詞を保存できませんでした。',
    unableDeleteVerb: '動詞を削除できませんでした。',
    duplicateVerb: 'この動詞はすでに保存されています。',
    refresh: '更新',
  },
};

type TranslationSet = typeof translations.en;

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationSet;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('japanese_portal_locale') as Locale | null;
    if (saved === 'en' || saved === 'ja') {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('japanese_portal_locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
