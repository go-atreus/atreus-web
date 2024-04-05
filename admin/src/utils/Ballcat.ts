import type { GLOBAL } from '@/typings';
import type { ProjectSetting } from '@/config/ProjectConfig';
import settings from '@/config/ProjectConfig';
import { history } from 'umi';

export const token_key = 'access-token';
export const user_key = 'user';
export const dict_data_key = 'dict_data';
export const dict_hash_key = 'dict_hash';
export const layout_setting_key = 'layout_setting';
export const login_uri = '/user/login';

export function getKey(key: string): string {
  return `${settings.storageOptions?.namespace}${key}`;
}

export function get(key: string): string | null {
  return localStorage.getItem(getKey(key));
}

export function set(key: string, val: any): void {
  localStorage.setItem(getKey(key), val);
}

export function remove(key: string): void {
  localStorage.removeItem(getKey(key));
}

export const Token = {
  get: () => {
    return get(token_key);
  },
  set: (val: any) => {
    set(token_key, val);
  },
  clean: () => {
    remove(token_key);
  },
};

export const User = {
  get: () => {
    return get(user_key);
  },
  set: (val: any) => {
    set(user_key, val);
  },
  clean: () => {
    remove(user_key);
  },
};


export const LayoutSetting = {
  get: (): ProjectSetting => {
    const ls = get(layout_setting_key);
    if (ls) {
      return JSON.parse(ls);
    }
    return { ...settings };
  },
  set: (ps: Partial<ProjectSetting>) => {
    set(layout_setting_key, JSON.stringify(ps));
  },
};

/**
 * 判断当前是否已登录
 * @param initialState  全局上下文内容
 */
export function isLogin(initialState?: GLOBAL.Is) {
  // 当前在登录页, 未登录
  if (history && history.location.pathname === login_uri) {
    return false;
  }

  if (!initialState || !initialState?.user) {
    return !!Token.get();
  }

  // 存在token 已登录
  return !!initialState?.user?.access_token && !!Token.get();
}
