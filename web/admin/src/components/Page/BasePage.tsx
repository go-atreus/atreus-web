import React, { useEffect, useRef, useState } from 'react';
import Table from '@/components/Table';
import type { ActionType } from '@ant-design/pro-table';
import type { BasePageProps, PageTableColumns } from '.';
import Auth from '../Auth';
import { defautlTitle } from '../Form';
import I18n from '@/utils/I18nUtils';
import { PlusOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

const BasePage = <T, U, E, ValueType = 'text'>({
  title,
  rowKey,
  query,
  columns,
  toolBarActions,
  children,
  operateBar,
  operateBarProps,
  del,
  formData = (data) => data as unknown as E,
  tableProps,
  tableRef: pTableRef,
  formRef,
  perStatusChange = () => undefined,
}: BasePageProps<T, U, E, ValueType>) => {
  let tableRef = useRef<ActionType>();

  if (pTableRef) {
    tableRef = pTableRef;
  }

  const [toolBarActionsList, setToolBarActionsList] = useState<React.ReactNode[]>([]);
  const [tableColumns, setTableColumns] = useState<PageTableColumns<T, ValueType>[]>([]);

  // 表格上方工具栏更新
  useEffect(() => {
    const list: React.ReactNode[] = [];
    if (toolBarActions && toolBarActions.length > 0) {
      toolBarActions.forEach((tb) => {
        if (!React.isValidElement(tb)) {
          list.push(
            <Auth.Button
              domKey="page-tool-bar-action-create"
              type="primary"
              icon={<PlusOutlined />}
              // @ts-ignore
              permission={tb.permission}
              text={defautlTitle.create}
              onClick={() => {
                if (perStatusChange('create') === false) {
                  return;
                }
                formRef.current?.create();
              }}
            />,
          );
        } else {
          list.push(tb);
        }
      });
    }
    setToolBarActionsList(list);
  }, [toolBarActions]);

  // 表格列更新
  useEffect(() => {
    const newColumns: PageTableColumns<T, ValueType>[] = [];

    (columns || []).forEach((col) => {
      const newCol = { ...col };

      if (col.cssEllipsis) {
        // ellipsis 处理
        newCol.ellipsis = false;
        newCol.render = (defaultDom, entity, index, action, schema) => {
          let dom = defaultDom;

          if (col.render) {
            dom = col.render(defaultDom, entity, index, action, schema);
          }

          // 包裹提示信息
          dom = (
            <Tooltip
              key={`page-column-ellipsis-tooltip-${col.title}-${col.dataIndex}`}
              title={defaultDom}
            >
              {dom}
            </Tooltip>
          );

          return (
            <div key={`page-column-ellipsis-${col.title}-${col.dataIndex}`} className="text-ellips">
              {dom}
            </div>
          );
        };
      }

      newColumns.push(newCol);
    });

    if (operateBar && operateBar.length > 0) {
      newColumns.push({
        title: I18n.text('form.operate'),
        width: 160,
        fixed: 'right',
        ...operateBarProps,
        hideInSearch: true,
        render: (dom, record) => {
          const nodes: React.ReactNode[] = [];

          operateBar.forEach((ob) => {
            if (typeof ob === 'function') {
              nodes.push(ob(dom, record));
              return;
            }

            let obProps;

            if (typeof ob.props === 'function') {
              obProps = ob.props(record);
            } else {
              obProps = ob.props;
            }

            if (ob.type === 'read') {
              nodes.push(
                <Auth.A
                  key={`page-auth-read-${record[rowKey]}`}
                  domKey={`page-auth-read-${record[rowKey]}`}
                  text={defautlTitle.read}
                  {...obProps}
                  permission={ob.permission}
                  onClick={() => {
                    if (perStatusChange('read') === false) {
                      return;
                    }
                    formRef.current?.read(formData(record));
                  }}
                />,
              );
            } else if (ob.type === 'edit') {
              nodes.push(
                <Auth.A
                  key={`page-auth-edit-${record[rowKey]}`}
                  domKey={`page-auth-edit-${record[rowKey]}`}
                  text={defautlTitle.edit}
                  {...obProps}
                  permission={ob.permission}
                  onClick={() => {
                    if (perStatusChange('edit') === false) {
                      return;
                    }
                    formRef.current?.edit(formData(record));
                  }}
                />,
              );
            } else {
              nodes.push(
                <Auth.A
                  key={`page-auth-del-${record[rowKey]}`}
                  domKey={`page-auth-del-${record[rowKey]}`}
                  text={defautlTitle.del}
                  confirmTitle={I18n.text('form.del.config')}
                  {...obProps}
                  style={{ color: '#ff4d4f', ...obProps?.style }}
                  permission={ob.permission}
                  onClick={() => {
                    if (del === undefined) {
                      I18n.error({
                        key: 'form.error.request',
                        params: { title: defautlTitle.del },
                      });
                      return;
                    }
                    del(record).then(() => {
                      tableRef.current?.reload();
                      I18n.success('global.operation.success');
                    });
                  }}
                />,
              );
            }
          });

          return <Auth.Group key={`page-auth-group-${record[rowKey]}`}>{nodes}</Auth.Group>;
        },
      });
    }

    setTableColumns(newColumns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, operateBar]);

  return (
    <>
      <Table<T, U, ValueType>
        {...tableProps}
        rowKey={rowKey}
        columns={tableColumns}
        request={query}
        headerTitle={title}
        actionRef={tableRef}
        toolbar={{ ...tableProps?.toolbar, actions: toolBarActionsList }}
      />

      {children}
    </>
  );
};

export default BasePage;
