import type { TableProps } from '@/components/Table/typings';
import ProTable from '@ant-design/pro-table';
// @ts-ignore
import type { SearchConfig } from '@ant-design/pro-table/components/Form/FormRender';
import { Button } from 'antd';
import { useEffect, useState } from 'react';

const getSearch = (search: false | SearchConfig) => {
  let proSearch = search;
  if (proSearch === undefined || proSearch === null) {
    proSearch = {};
  }

  if (proSearch && !proSearch.optionRender) {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    proSearch.optionRender = (sc, fp, dom) => {
      const { form } = sc;
      return (
        <div>
          <Button
            style={{ marginRight: '5px' }}
            type={'primary'}
            // @ts-ignore
            loading={sc.submitter.props.submitButtonProps.loading}
            onClick={() => {
              form?.submit();
            }}
          >
            {sc.searchText}
          </Button>

          <Button
            onClick={() => {
              form?.resetFields();
            }}
          >
            {sc.resetText}
          </Button>
        </div>
      );
    };
  }
  return proSearch;
};

const Table = <T extends Record<string, any>, U extends Record<string, any>, ValueType = 'text'>(
  props: TableProps<T, U, ValueType>,
) => {
  const { search, request, rowKey, options, rowSelection } = props;
  const { pagination = {} } = props;
  const [tableSearch, setTableSearch] = useState<any>();

  let { onRow, scroll } = props;
  if (!onRow) {
    onRow = () => {
      return {
        onClick: (e) => {
          if (
            e.target instanceof HTMLElement &&
            (e.target.tagName.toUpperCase() === 'TD' || e.target?.tagName.toUpperCase() === 'TR')
          ) {
            // 单击表格中的非展示数据元素， 选中当前列
            if (rowSelection && rowSelection.type) {
              const es = e.currentTarget.getElementsByClassName(`ant-${rowSelection.type}-wrapper`);
              if (es && es[0] instanceof HTMLElement) {
                es[0].click();
              }
            }
          }
        },
      };
    };
  }

  if (!scroll) {
    scroll = { x: '100%' };
  }

  if (pagination !== false) {
    // 设置默认的分页大小
    if (!pagination.pageSize) {
      pagination.pageSize = 10;
    }
    // 默认开启快速跳转
    if (pagination.showQuickJumper === undefined || pagination.showQuickJumper === null) {
      pagination.showQuickJumper = true;
    }

    if (pagination.showSizeChanger === undefined) {
      pagination.showSizeChanger = true;
    }
  }

  useEffect(() => {
    setTableSearch(getSearch(search));
  }, [search]);

  return (
    <ProTable<T, U, ValueType>
      {...props}
      onRow={onRow}
      scroll={scroll}
      pagination={pagination}
      options={
        options !== false
          ? {
              fullScreen: true,
              reload: true,
              setting: true,
              density: true,
              // 采用覆盖默认值形式
              ...options,
            }
          : false
      }
      search={tableSearch}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      request={async (p, sort, filter) => {
        const retData: { data: T[]; success: boolean; total: number } = {
          data: [],
          success: true,
          total: 0,
        };
        if (!request) {
          return Promise.resolve(retData);
        }

        const sortArr: string[] = [];
        const keys = sort ? Object.keys(sort) : [];

        // 排序处理
        if (keys.length > 0) {
          keys.forEach((key) => {
            sortArr.push(`${key},${sort[key] === 'ascend' ? 'asc' : 'desc'}`);
          });
        } else if (typeof rowKey === 'string') {
          sortArr.push(`${rowKey},desc`);
        }

        const page = p.current;
        const size = p.pageSize;
        delete p.current;
        delete p.pageSize;

        const params: any = {
          ...p,
          page,
          size,
          sort: sortArr,
        };
        const res = await request(params);
        const { results, total } = res?.data || {};

        if (results) {
          // 分页处理
          retData.data = results;
          retData.total = total;
        } else {
          // 不分页. 默认返回的data就是完整的数据
          retData.data = res.data as unknown as T[];
          retData.total = retData.data.length;
        }

        return retData;
      }}
    />
  );
};

export default Table;
