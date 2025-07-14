export enum CONDITION_EXTERNAL_OPERATOR {
  AND = 'AND',
  OR = 'OR',
}

export enum CONDITION_INTERNAL_OPERATOR {
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
  EQ = '=',
}

export enum SORT_ORDER {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum CONDITION_FIELD_TYPE {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
}

export const paginationMinTakeCount = 1;
export const paginationMaxTakeCount = 50;
export const paginationMidTakeCount = 20;

export const paginationDescription = `<p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">Filters must be filled with the condition array in the form of&nbsp;</span><b style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">Query String</b></p>
  <p><br></p>
  <p><b style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">How to create a query expression in Query String format:</b></p>
  <p><br></p>
  <p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">1- All conditions are placed in an array called &quot;<strong>filter</strong>&quot;.</span></p>
  <p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">2- Each item of the filter array contains two parameters, which are &quot;<strong>condition</strong>&quot; and &quot;<strong>nextOperator</strong>&quot;.</span></p>
  <p><br></p>
  <p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;"><strong>condition:&nbsp;</strong> Query criterion that includes 4 parameters in order:&nbsp;</span></p>
  <ul>
      <li><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">&quot;<strong>field</strong>&quot;: condition field (for example: name)&nbsp;</span></li>
      <li><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">&quot;<strong>type</strong>&quot; : type of condition&apos;s field (for example: string) (available values: string - number - boolean)&nbsp;</span></li>
      <li><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">&quot;<strong>value</strong>&quot; : the value of <span style="color: rgb(59, 65, 81); font-family: Times; font-size: medium; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgba(97, 175, 254, 0.1); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; display: inline !important; float: none;">condition</span> (for example: jack)&nbsp;</span></li>
      <li><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">&quot;<strong>operator</strong>&quot; : condition operation operator (for example: =) (available values: = , &gt; , &lt; , &gt;= , &lt;= )&nbsp;</span></li>
  </ul>
  <p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;"><strong>nextOperator</strong>: This field works if there are several condition objects in the filter array and it means that it specifies the operation between the filter array items. So if we have only one condition object we need to remove it and also if there are several condition objects it should be removed for the last one.</span></p>
  <p><br></p>
  <p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">If we convert the above rules to &quot;json format&quot;, we get the following form:</span></p>
  <p><br></p>
  <p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">For example: The condition to fetch all data that have&nbsp;</span><b style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">name</b><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">&nbsp;equal to&nbsp;</span><b style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">jack</b><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">&nbsp;and&nbsp;</span><b style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">age</b><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">&nbsp;greater than&nbsp;</span><b style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">20</b><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">:</span></p>
  <p><br></p>
  <p><i style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">Json Format:&nbsp;</i><b style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">[ { condition: { field: &apos;name&apos;, type: &apos;string&apos;, value: &apos;jack&apos;, operator: &apos;=&apos;, }, nextOperator: &apos;AND&apos; }, { condition: { field: &apos;age&apos;, type: &apos;number&apos;, value: &apos;20&apos;, operator: &apos;&gt;&apos; } } ]</b></p>
  <p><br></p>
  <p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">Note: Each item of the above json must be changed to the query string format as in the following example:</span></p>
  <p><br></p>
  <p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">{ filters: [ { condition: { p1: 1 } }, { condition: { p1: 2 } } ] } =&gt; filters[0][condition][p1]=1,filters[2][condition][p1]=2</span></p>
  <p><br></p>
  <p><span style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">Converting the entire json example to a query string expression:</span></p>
  <p><br></p>
  <p><i style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">QueryString Format:&nbsp;</i><b style="text-align: start;color: rgb(59, 65, 81);background-color: rgba(97, 175, 254, 0.1);font-size: medium;">?page=1&amp;take=20&amp;filters[0][condition][field]=name&amp;filters[0][condition][operator]==&amp;filters[0][condition][value]=jack&amp;filters[0][condition][type]=string&amp;filters[0][nextOperator]=AND&amp;filters[1][condition][field]=age&amp;filters[1][condition][operator]=&gt;&amp;filters[1][condition][value]=20&amp;filters[1][condition][type]=number</b></p>
  <p><br></p>`;
