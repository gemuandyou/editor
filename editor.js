(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  // JavaScript模块加载有CMD和AMD两种，下面代码为了支持AMD加载。 define是AMD模块定义的方法。
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Editor = factory());
})(this, (function () {
  'use strict'; // 使用严格模式

  // 当前编辑行
  var $currEditTarget;
  // 当前编辑行分割信息
  var currEditTargetSplitInfo = {};

  function Editor() {}

  /**
   * 初始化
   */
  Editor.init = function(element, options) {
    Editor.$editor = $(element);
    var $editor = Editor.$editor;
    $editor.addClass('gm-editor');
    // 初始化临时span，用来计算每个字符宽度
    $editor.append('<span class="gm-editor-tmp-word" hidden></span>');
    // 初始化初始化光标
    $editor.append('<span class="gm-editor-cursor"></span>');
    // 初始化临时文本框
    $editor.append('<textarea class="gm-editor-tmp-textarea"></textarea>');
    // 初始化第一行
    $editor.append('<span class="gm-editor-row">tessfjsadjfjasld，，是，，s,s,d水电asdfasd费静安寺劳动法jflasjlfdt</span>');
    $editor.append('<span class="gm-editor-row">tessfjsadjfjasld，，是，，s,s,d水电asdfasd费静安寺劳动法jflasjlfdt</span>');

    listenerClick();
    listenerTextarea();

    return this;
  }

  /**
   * 绑定点击事件
   */
  function listenerClick() {
    document.addEventListener('click', function(ev) {
      $('.gm-editor-tmp-textarea').val('');
      $('.gm-editor-tmp-textarea').blur();

      var $currentEle = $(ev.target);
      var currPageX = ev.pageX;
      var currPageY = ev.pageY;
      var currOffsetX = ev.offsetX;
      var currOffsetY = ev.offsetY;

      // 当前鼠标点击元素是否在编辑器中
      var editorTop = Editor.$editor.offset().top;
      var editorTop1 = editorTop + Editor.$editor.height();
      var editorLeft = Editor.$editor.offset().left;
      var editorLeft1 = editorLeft + Editor.$editor.width();
      if (currPageX > editorLeft && currPageX < editorLeft1 && currPageY > editorTop && currPageY < editorTop1) {
        $('.gm-editor-cursor').show();
      } else {
        $('.gm-editor-cursor').hide();
        return;
      }

      // 若点击位置在字符串中，则解析当前编辑行，获取当前编辑行中点击位置前后的字符串
      if ($currentEle.hasClass('gm-editor-row')) {
        $currEditTarget = $currentEle;
        currEditTargetSplitInfo = splitStatementRow(currOffsetX, currOffsetY);
        $('.gm-editor-cursor').offset({ top: currEditTargetSplitInfo.splitY, left: currEditTargetSplitInfo.splitX + editorLeft });
        $('.gm-editor-tmp-textarea').focus();
      }

    });
  }

  /**
   * 监听临时文本框
   */
  function listenerTextarea() {
    $('.gm-editor-tmp-textarea').keyup(function() {
      var appendText = $(this).val();
      console.log(appendText)
      if (appendText) {
        appendToCurrentTarget(appendText);
      }
    });
  }

  /**
   * 向当前焦点的编辑行中插入内容
   * @param {string} appendText 
   */
  function appendToCurrentTarget(appendText) {
    var head = currEditTargetSplitInfo.part1;
    var tail = currEditTargetSplitInfo.part2;
    $currEditTarget.text(head + appendText + tail);

    recalculateCursorPos(appendText);
  }

  /**
   * 将鼠标点击位置的编辑行内容根据点击位置将语句分割为两部分
   * @param {number} currX 鼠标点击X轴坐标
   * @param {number} currY 鼠标点击Y轴坐标
   * @return {part1: [语句分割的第一部分], part2: [语句分割的第二部分], splitX: [分割位置X坐标], splitY: [分割位置Y坐标]}
   */
  function splitStatementRow(currX, currY) {
    var splitInfo = { part1: '', part2: '', splitX: 0, splitY: $currEditTarget.offset().top };
    var statement = $currEditTarget.text();
    var words = statement.split('');
    var $tmpSpan = $('.gm-editor-tmp-word');
    
    words.forEach(word => {
      var preWordWidth = $tmpSpan.width();
      $tmpSpan.text(word);
      var wordWidth = $tmpSpan.width();

      if (splitInfo.splitX < currX && (currX - splitInfo.splitX) > wordWidth / 2) {
        splitInfo.splitX += wordWidth;
        splitInfo.part1 += word;
      } else {
        splitInfo.part2 += word;
      }
    });
    $tmpSpan.text('');

    return splitInfo;
  }

  /**
   * 重新定位光标位置
   * @param {string} appendText 
   */
  function recalculateCursorPos(appendText) {
    var $tmpSpan = $('.gm-editor-tmp-word');
    var words = appendText.split('');
    var appendWidth = 0;
    words.forEach(word => {
      $tmpSpan.text(word);
      var wordWidth = $tmpSpan.width();
      appendWidth += wordWidth;
    });
    
    var editorLeft = Editor.$editor.offset().left;
    var oldLeft = currEditTargetSplitInfo.splitX + editorLeft;
    $('.gm-editor-cursor').offset({ left: oldLeft + appendWidth });
  }

  return Editor;

}));