import React from 'react';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { useLocales } from '../../providers/LocaleProvider';
import { fetchNui } from '../../utils/fetchNui';
import type { InputProps } from '../../typings';
import { OptionValue } from '../../typings';
import InputField from './components/fields/input';
import CheckboxField from './components/fields/checkbox';
import SelectField from './components/fields/select';
import NumberField from './components/fields/number';
import SliderField from './components/fields/slider';
import { useFieldArray, useForm } from 'react-hook-form';
import ColorField from './components/fields/color';
import DateField from './components/fields/date';
import TextareaField from './components/fields/textarea';
import TimeField from './components/fields/time';
import dayjs from 'dayjs';

export type FormValues = {
  test: {
    value: any;
  }[];
};

const InputDialog: React.FC = () => {
  const [fields, setFields] = React.useState<InputProps>({
    heading: '',
    rows: [{ type: 'input', label: '' }],
  });
  const [visible, setVisible] = React.useState(false);
  const { locale } = useLocales();

  const form = useForm<FormValues>({
    defaultValues: { test: [] },
  });

  const fieldForm = useFieldArray({
    control: form.control,
    name: 'test',
  });

  useNuiEvent<InputProps>('openDialog', (data) => {
    // 1. Map the initial form values safely without breaking strict union types
    const initialFormValues = data.rows.map((row) => {
      const rowData = row as any;
      let initialValue = row.type === 'checkbox' ? !!rowData.checked : rowData.default;

      if (row.type === 'date' || row.type === 'date-range' || row.type === 'time') {
        if (rowData.default === true) {
          initialValue = new Date().getTime();
        } else if (Array.isArray(rowData.default)) {
          initialValue = rowData.default.map((date: string | number | Date) => new Date(date).getTime());
        } else if (rowData.default) {
          initialValue = new Date(rowData.default).getTime();
        } else {
          initialValue = null;
        }
      }

      return {
        value: initialValue ?? (row.type === 'checkbox' ? false : ''),
      };
    });

    // 2. Safely fix backwards compatibility for Select fields directly on the incoming object
    data.rows.forEach((row) => {
      if (row.type === 'select' || row.type === 'multi-select') {
        const selectRow = row as any;
        if (selectRow.options) {
          selectRow.options = selectRow.options.map((option: OptionValue) =>
            !option.label ? { ...option, label: option.value } : option
          );
        }
      }
    });

    // 3. Update state and reset the form cleanly
    setFields(data);
    form.reset({ test: initialFormValues });
    setVisible(true);
  });

  useNuiEvent('closeInputDialog', async () => await handleClose(true));

  const handleClose = async (dontPost?: boolean) => {
    setVisible(false);
    await new Promise((resolve) => setTimeout(resolve, 200));
    form.reset({ test: [] });
    if (dontPost) return;
    fetchNui('inputData');
  };

  const onSubmit = form.handleSubmit(
    async (data) => {
      setVisible(false);
      const values: any[] = [];

      for (let i = 0; i < fields.rows.length; i++) {
        const row = fields.rows[i];
        if ((row.type === 'date' || row.type === 'date-range') && (row as any).returnString) {
          if (!data.test[i]) continue;
          data.test[i].value = dayjs(data.test[i].value).format((row as any).format || 'DD/MM/YYYY');
        }
      }

      data.test.forEach((obj) => values.push(obj.value));

      await new Promise((resolve) => setTimeout(resolve, 200));
      form.reset({ test: [] });
      fetchNui('inputData', values);
    },
    (errors) => {
      console.error('Form Validation Errors:', errors);
    }
  );

  return (
    <>
      {visible && (
        <div className="customModalOverlay" onClick={(e) => e.stopPropagation()}>
          <div className="customModalContent" onClick={(e) => e.stopPropagation()}>
            <div className="topCont">
              <h2 className="customModalTitle">{fields.heading}</h2>
              <h3 className="customModalheader">Palun täida kõik vajalikud väljad.</h3>
            </div>

            <form onSubmit={onSubmit}>
              <div className="customModalBody no-scrollbar">
                {fieldForm.fields.map((item, index) => {
                  const row = fields.rows[index];
                  if (!row) return null;

                  return (
                    <React.Fragment key={item.id}>
                      {row.type === 'input' && (
                        <InputField
                          register={form.register(`test.${index}.value`, { required: (row as any).required })}
                          row={row}
                          index={index}
                        />
                      )}
                      {row.type === 'checkbox' && (
                        <CheckboxField
                          register={form.register(`test.${index}.value`, { required: (row as any).required })}
                          row={row}
                          index={index}
                        />
                      )}
                      {(row.type === 'select' || row.type === 'multi-select') && (
                        <SelectField row={row} index={index} control={form.control} />
                      )}
                      {row.type === 'number' && <NumberField control={form.control} row={row} index={index} />}
                      {row.type === 'slider' && <SliderField control={form.control} row={row} index={index} />}
                      {row.type === 'color' && <ColorField control={form.control} row={row} index={index} />}
                      {row.type === 'time' && <TimeField control={form.control} row={row} index={index} />}
                      {(row.type === 'date' || row.type === 'date-range') && (
                        <DateField control={form.control} row={row} index={index} />
                      )}
                      {row.type === 'textarea' && (
                        <TextareaField
                          register={form.register(`test.${index}.value`, { required: (row as any).required })}
                          row={row}
                          index={index}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="customModalButtons">
                <button
                  type="button"
                  className="cancelButton2"
                  onClick={() => handleClose()}
                  disabled={fields.options?.allowCancel === false}
                >
                  {locale.ui.cancel}
                </button>

                <button type="submit" className="confirmButton2">
                  {locale.ui.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default InputDialog;
