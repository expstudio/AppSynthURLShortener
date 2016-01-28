(function (angular) {
    'use strict';
    function printDirective() {
        var printSection = document.getElementById('printSection');
        // if there is no printing section, create one
        if (!printSection) {
            printSection = document.createElement('div');
            printSection.id = 'printSection';
            document.body.appendChild(printSection);
            console.log('wase here')
        }
        function link(scope, element, attrs) {
            element.on('click', function () {
                var elemToPrint = document.getElementById(attrs.printElementId);
                if (elemToPrint) {
                    printElement(elemToPrint);
                }
            });
            window.onafterprint = function () {
                // clean the print section before adding new content
                console.log('is it working here');
                printSection.innerHTML = '';
            }
        }
        function printElement(elem) {
            // clones the element you want to print
            printSection.innerHTML = '';
            var domClone = elem.cloneNode(true);
            printSection.appendChild(domClone);
            window.print();
        }
        return {
            link: link,
            restrict: 'A'
        };
    }
    APP.directive('ngPrint', [printDirective]);
}(window.angular));