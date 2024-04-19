import { isLogin } from '@/utils/Ballcat';
import I18n from '@/utils/I18nUtils';
import type { ExpandRoute } from '@/utils/RouteUtils';
import { getRoute } from '@/utils/RouteUtils';
import PageLoading from '@/loading';
import { useCallback, useEffect, useState, lazy } from 'react';
import {  useModel } from 'umi';

const getFirstUrl = (menuArray: ExpandRoute[]): string | undefined => {
  for (let index = 0; index < menuArray.length; index += 1) {
    const menu = menuArray[index];
    // 菜单未隐藏
    if (!menu.hideInMenu) {
      // 如果存在子级 且子级的第一个菜单存在路径
      if (menu.children && menu.children.length > 0 && menu.children[0].path) {
        const url = getFirstUrl(menu.children);
        // 存在首页
        if (url) {
          return url;
        }
      }
      // 不存在, 且当前菜单是页面
      else if (menu.exact) {
        return menu.path;
      }
    }
  }

  return undefined;
};

export default () => {
  const { initialState } = useModel('@@initialState');
  const [routeArray, setMenuArray] = useState<ExpandRoute[]>([]);
  const [firstPath, setMenuFirst] = useState<string>();
  const [load, setLoad] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    return getRoute()
      .then((resMenuArray) => {
        const newMenuArray: ExpandRoute[] = [];
        newMenuArray.push(...resMenuArray);
        newMenuArray.push({
          component: lazy(() => import('@/pages/exception/404')),
        });
        setMenuArray(newMenuArray);
        setMenuFirst(getFirstUrl(newMenuArray));
        setLoad(false);
      })
      .catch((err) => {
        console.error(err)
        I18n.error('menu.load.failed');
      });
  }, []);

  useEffect(() => {
    if (initialState && isLogin(initialState)) {
      refresh();
    }
  }, [initialState, refresh]);

  return { routeArray, firstPath, refresh, load, setLoad };
};
