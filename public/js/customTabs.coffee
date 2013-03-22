$(document).ready () -> 
  $('#tabs .tabWrap').hide()
  $('#tabs .tabWrap:first').css("display","inline-block")
  $('#tabs ul li:first').addClass('active')
  
  $('#tabs ul li a').click ()-> 
    $('#tabs ul li').removeClass('active')
    $(this).parent().addClass('active')
    currentTab = $(this).attr('href') 
    $('#tabs .tabWrap').hide()
    $(currentTab).css("display","inline-block")
    return false